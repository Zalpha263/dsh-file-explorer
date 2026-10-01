// dsh-file-explorer — Host half.
//
// v2.0.0 起本插件的职责收窄成一件事：**给官方只读预览补上编辑能力**。
// 官方文件浏览（dsh-client-ui-sidebar-files）与文档预览
// （dsh-client-ui-sidebar-documentpreview）负责"看"，而且官方在 API 层面明确
// 不提供任何变更操作（@deepseek-ai/dsh-api-workspace-files README 原文：
// "The service exposes no mutation operation."）。所以宿主只暴露三个方法：
//
//   fsStat(path)                            读元数据与版本令牌（变更轮询用）
//   fsRead(path, maxBytes)                  读一段文本 + 版本令牌 + 文本/二进制判定
//   fsWrite(path, content, expectedVersion) 带乐观并发校验的写回
//
// 目录树、新建/改名/复制/移动/删除、回收站、渲染管线都已随职责一起删除。
//
// 注册面：TypertRemoteService 的构造器通过 ctx.reflect.provide 注册服务并写
// typertRemote；下面用「不用装饰器语法」的手工标记把方法标成 Remote（Node 24
// 默认拒绝 stage-3 装饰器）。网关从方法源码推导参数线序，参数名必须是简单标识符，
// 客户端 contribution 按位置匹配。

import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { realpath } from 'node:fs/promises'
import { dirname, join, basename, resolve } from 'node:path'

const DEFAULT_MAX_BYTES = 2 * 1024 * 1024
/** 编辑上限：超过这个大小不给编辑（截断后保存会把内容截掉）。 */
const EDIT_MAX_BYTES = 2 * 1024 * 1024

/**
 * 让宿主 fs 写入与【会话策略】一致，而不是落回部署默认策略。
 * 会话设为 read-only（或 cwd 与部署 fallback root 不同）时，写入必须按同一会话的
 * mode/root 裁决。找不到任何会话时退回无参 resolve()（部署默认）。
 */
function sandboxPolicyFor(ctx) {
  const policy = ctx.get('sandboxPolicy')
  if (policy === undefined || policy === null || typeof policy.resolve !== 'function') return undefined
  const agents = ctx.get('agents')
  if (agents !== undefined) {
    try {
      const roots = agents.roots()
      for (let i = roots.length - 1; i >= 0; i--) {
        const session = roots[i] && roots[i].session
        if (session !== undefined && session !== null) return policy.resolve({ session })
      }
    } catch (err) { /* fall through to the deployment default */ }
  }
  return policy.resolve()
}

/** 稳定版本令牌：后端不透明的 FsInfo.version，与 fsWrite 的陈旧守卫同族。 */
function versionOf(info) {
  if (!info) return null
  if (typeof info.version === 'string' && info.version !== '') return info.version
  return null
}

/** 最近的工作区信号（会话事件驱动），供相对路径解析使用。 */
let runningCwd = null
let recentCwd = null

function cwdOf(session) {
  if (session && session.header && typeof session.header.cwd === 'string' && session.header.cwd !== '') {
    return session.header.cwd
  }
  return null
}

/** 把可能是相对路径的输入解析成绝对路径（相对时以最近会话的工作目录为基准）。 */
function toAbsolute(input) {
  if (typeof input !== 'string' || input.trim() === '') throw new Error('path is required')
  const candidate = input.trim()
  if (candidate.startsWith('/') || /^[A-Za-z]:[\\/]/.test(candidate) || /^\\\\[^\\]+\\/.test(candidate)) return candidate
  const base = runningCwd || recentCwd || process.cwd()
  return join(base, candidate)
}

/**
 * UTF-8 安全切片：n 落在代理对中间时回退一个字符，避免把 emoji 劈成两半。
 * （原实现从渲染模块借这个函数，渲染层已删除，就地内联。）
 */
function safeSlice(str, n) {
  if (n <= 0 || n >= str.length) return str.slice(0, n)
  const last = str.charCodeAt(n - 1)
  const next = str.charCodeAt(n)
  if (last >= 0xD800 && last <= 0xDBFF && next >= 0xDC00 && next <= 0xDFFF) return str.slice(0, n - 1)
  return str.slice(0, n)
}

/** 归一化路径用于包含性比较：去尾分隔符；Windows 下大小写不敏感。 */
function normPath(p) {
  const trimmed = String(p).replace(/[\\/]+$/, '')
  return process.platform === 'win32' ? trimmed.toLowerCase() : trimmed
}

/**
 * 规范化到「真实路径」再做包含性比较：词法 resolve 不跟随符号链接与 Windows
 * junction，工作区内指向外部的链接会骗过前缀比较。目标尚不存在时回退到
 * 「父目录 realpath + basename」；探测失败时回退词法形式（不因探测故障误拒）。
 */
async function canonicalPath(p) {
  try {
    return normPath(await realpath(p))
  } catch (err) {
    try {
      const parent = dirname(p)
      if (parent && parent !== p) return normPath(join(await realpath(parent), basename(p)))
    } catch (err2) { /* fall through to lexical */ }
  }
  return normPath(resolve(p))
}

/** 工作区根：优先最近活跃会话，其次工作区注册表，最后会话沙箱策略。 */
async function resolveWorkspaceRoot(ctx) {
  const agents = ctx.get('agents')
  if (agents !== undefined) {
    try {
      const roots = agents.roots()
      for (let i = roots.length - 1; i >= 0; i--) {
        const cwd = cwdOf(roots[i] && roots[i].session)
        if (cwd) return cwd
      }
    } catch (err) { /* fall through */ }
  }
  const registry = ctx.get('workspaceRegistry')
  if (registry !== undefined) {
    try {
      const list = await registry.list()
      if (list.length > 0 && typeof list[0].path === 'string') return list[0].path
    } catch (err) { /* fall through */ }
  }
  const policy = ctx.get('sandboxPolicy')
  return policy ? policy.workspaceRoot : null
}

/**
 * 写入边界：目标必须落在当前工作区内。读操作不受限（官方预览也能读工作区外的
 * 文件），只有写入被约束。词法归一化 + realpath 复核，挡 `..` 穿越与链接逃逸。
 */
async function assertInsideWorkspace(ctx, filePath) {
  const root = await resolveWorkspaceRoot(ctx)
  if (root === null || root === '') {
    throw new Error('无法确定工作区根目录，已拒绝写入：' + filePath)
  }
  const sep = process.platform === 'win32' ? '\\' : '/'
  const rootNorm = normPath(resolve(root))
  const pathNorm = normPath(resolve(filePath))
  if (pathNorm !== rootNorm && !pathNorm.startsWith(rootNorm + sep)) {
    throw new Error('目标不在当前工作区内，已拒绝：' + filePath)
  }
  const rootReal = await canonicalPath(root)
  const pathReal = await canonicalPath(filePath)
  if (pathReal !== rootReal && !pathReal.startsWith(rootReal + sep)) {
    throw new Error('目标经符号链接/连接点解析后不在当前工作区内，已拒绝：' + filePath)
  }
}

class FileExplorerService extends TypertRemoteService {
  constructor(ctx) {
    super(ctx, 'fileExplorer')
  }

  /** 元数据 + 版本令牌。编辑页用它轮询"磁盘上的文件是否被外部改过"。 */
  async fsStat(path) {
    const fs = this.ctx.get('fs')
    if (fs === undefined) throw new Error('fs service unavailable')
    const target = await fs.resolve(toAbsolute(path))
    const info = await fs.stat(target)
    if (info === undefined) throw new Error('not found: ' + path)
    return {
      path: fs.processPath(target),
      type: info.type,
      size: info.size === undefined ? null : info.size,
      version: versionOf(info)
    }
  }

  /**
   * 读一段文本。返回路径、大小、版本令牌、是否截断、是否二进制，以及
   * `decodeValid`：文本里是否出现了 U+FFFD 替换字符。为 false 表示这些字节
   * **不是合法 UTF-8**（GBK / UTF-16 / CP1252 等旧编码），客户端必须拒绝编辑——
   * 否则用户会在乱码上改，写回时把原文件彻底毁掉。
   */
  async fsRead(path, maxBytes) {
    const fs = this.ctx.get('fs')
    if (fs === undefined) throw new Error('fs service unavailable')
    if (typeof path !== 'string' || path.trim() === '') throw new Error('path is required')
    let limit = DEFAULT_MAX_BYTES
    if (typeof maxBytes === 'number' && Number.isFinite(maxBytes)) {
      limit = Math.min(Math.max(Math.floor(maxBytes), 1024), EDIT_MAX_BYTES)
    }
    const target = await fs.resolve(toAbsolute(path))
    const info = await fs.stat(target)
    if (info === undefined) throw new Error('not found: ' + path)
    if (info.type !== 'file') throw new Error('not a file: ' + path)
    const result = {
      path: fs.processPath(target),
      size: info.size === undefined ? null : info.size,
      version: versionOf(info)
    }
    try {
      // 流式读取，超限文件不会整份进内存；多读 1 字符再判定截断（恰好等于上限
      // 的文件不会被误标「已截断」）。
      let text = ''
      let truncated = false
      const cap = limit + 1
      const stream = await fs.streamText(target)
      for await (const chunk of stream) {
        if (text.length >= cap) break
        const need = cap - text.length
        text += chunk.length > need ? safeSlice(chunk, need) : chunk
      }
      if (text.length > limit) {
        text = safeSlice(text, limit)
        truncated = true
      }
      const decodeValid = text.indexOf('\uFFFD') < 0
      return Object.assign(result, { truncated: truncated, decodeValid: decodeValid, text: text })
    } catch (err) {
      if (err && err.code === 'FS_NOT_TEXT') return Object.assign(result, { binary: true })
      throw err
    }
  }

  /**
   * 带乐观并发校验的写回。
   *
   * expectedVersion 存在时把期望版本作为 `{ kind: 'replaceIfVersion' }` 意图交给
   * writeText：缺失/不匹配由宿主在同一临界区抛 FS_STALE_VERSION，校验与写入之间
   * 没有竞态窗口。前置 stat 比对只为给出更友好的报错。expectedVersion 为空
   * （新文件）时保持无条件写入。
   */
  async fsWrite(path, content, expectedVersion) {
    if (typeof content !== 'string') throw new Error('content must be a string')
    const fs = this.ctx.get('fs')
    if (fs === undefined) throw new Error('fs service unavailable')
    const filePath = toAbsolute(path)
    await assertInsideWorkspace(this.ctx, filePath)
    const target = await fs.resolve(filePath)
    const guarded = typeof expectedVersion === 'string' && expectedVersion !== ''
    if (guarded) {
      const info = await fs.stat(target)
      if (info === undefined) throw new Error('file no longer exists: ' + filePath)
      if (versionOf(info) !== expectedVersion) throw new Error('stale: 文件已被外部修改')
    }
    try {
      const outcome = await fs.writeText(
        target,
        content,
        guarded ? { kind: 'replaceIfVersion', version: expectedVersion } : undefined,
        undefined,
        sandboxPolicyFor(this.ctx)
      )
      const after = await fs.stat(target)
      return {
        path: fs.processPath(target),
        version: outcome.version,
        size: after ? after.size : null
      }
    } catch (err) {
      if (err && err.code === 'FS_SANDBOX_DENIED') {
        throw new Error('当前会话的沙箱策略不允许写入该文件：' + filePath)
      }
      if (err && (err.code === 'FS_STALE_VERSION' || err.code === 'FS_NOT_FOUND')) {
        throw new Error('stale: 文件已被外部修改')
      }
      throw err
    }
  }
}

// --- Manual Remote markers (decorator-syntax-free) ---
const proto = FileExplorerService.prototype
function markRemote(method) {
  const context = {
    private: false,
    static: false,
    name: method,
    addInitializer(cb) { this.cb = cb }
  }
  // Equivalent to `@Remote(method)` on the class method.
  Remote(method)(undefined, context)
  context.cb.call(Object.create(proto))
}
markRemote('fsStat')
markRemote('fsRead')
markRemote('fsWrite')

export function apply(ctx) {
  // TypertRemoteService 在构造器里注册 `fileExplorer` 并设置 typertRemote；
  // 网关的 source-mode 发现同时消费这两者。
  new FileExplorerService(ctx)

  ctx.on('agent/status', (payload) => {
    try {
      if (payload && payload.agent && payload.agent.session) {
        const cwd = cwdOf(payload.agent.session)
        if (cwd) runningCwd = cwd
      }
    } catch (err) { /* containment */ }
  })
  ctx.on('session/event', (session) => {
    try {
      const cwd = cwdOf(session)
      if (cwd) recentCwd = cwd
    } catch (err) { /* containment */ }
  })
}
