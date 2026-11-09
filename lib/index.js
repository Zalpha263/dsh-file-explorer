// dsh-file-explorer — Host half.
//
// 本插件的职责只有一件事：**给官方只读预览补上编辑能力**。官方文件浏览
// （dsh-client-ui-sidebar-files）与文档预览（dsh-client-ui-sidebar-documentpreview）
// 负责"看"，而且官方在 API 层面明确不提供任何变更操作
// （@deepseek-ai/dsh-api-workspace-files README：
// "The service exposes no mutation operation."）。所以宿主只暴露三个方法：
//
//   fsStat(path, sessionId?)                            版本令牌（变更轮询用）
//   fsRead(path, maxBytes, sessionId?)                  读一段文本 + 版本令牌 + 文本/二进制判定
//   fsWrite(path, content, expectedVersion, sessionId?) 带乐观并发校验的写回
//
// sessionId 是可选尾参：客户端从标签的 tab.contentId
// （dsh-resource://file/session/<sid>/…）里解析出会话身份后传入。带 sessionId 时：
//   · 相对路径按该会话的 session.header.cwd 解析；
//   · 写边界（assertInsideWorkspace）用同一个 cwd；
//   · 沙箱策略用 sandboxPolicy.resolve({ session })，不会把 A 会话的
//     workspace-write 借给 B 会话、也不会用另一个会话的根误拒合法写入。
// 不传 sessionId 时用于旧客户端/缓存页面：相对路径与写边界取“实时最近根会话”，
// 再回落到工作区注册表与部署默认根。
//
// 目录树、新建/改名/复制/移动/删除、回收站、渲染管线都已随职责一起删除。
//
// 注册面：TypertRemoteService 的构造器通过 ctx.reflect.provide 注册服务并写
// typertRemote；下面用「不用装饰器语法」的手工标记把方法标成 Remote（Node 24
// 默认拒绝 stage-3 装饰器）。网关从方法源码推导参数线序，参数名必须是简单标识符，
// 客户端 contribution 按位置匹配（尾参 sessionId 同样如此）。

import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { realpath } from 'node:fs/promises'
import {
  lstat as nodeLstat,
  mkdir as nodeMkdir,
  rename as nodeRename,
  unlink as nodeUnlink
} from 'node:fs/promises'
import { dirname, join, basename, resolve } from 'node:path'
import {
  platformName,
  toNativePath,
  relativePath,
  validateEntryName,
  isInsidePath
} from './paths.js'

/**
 * 读取与编辑共用的文本上限。超过它的文件不给编辑：fsRead 按 limit+1 判定截断，
 * 截断后保存会把内容截掉。客户端会显式传同一个值。
 */
const MAX_TEXT_BYTES = 2 * 1024 * 1024

/**
 * 解析可选尾参 sessionId。不传（旧客户端）返回 undefined，调用方走旧兜底；
 * 传了就必须能拿到该会话——拿不到时显式报错，绝不回落到"最近根会话"，否则
 * 又会出现跨会话借用策略/根的问题。
 */
function sessionById(ctx, sessionId) {
  if (typeof sessionId !== 'string' || sessionId === '') return undefined
  const sessions = ctx.get('sessions')
  if (sessions === undefined || sessions === null || typeof sessions.get !== 'function') {
    throw new Error('sessions service unavailable: cannot resolve session ' + sessionId)
  }
  const session = sessions.get(sessionId)
  if (session === undefined || session === null) throw new Error('session not found: ' + sessionId)
  return session
}

function cwdOf(session) {
  if (session && session.header && typeof session.header.cwd === 'string' && session.header.cwd !== '') {
    return session.header.cwd
  }
  return null
}

/**
 * 实时的“最近根会话”。旧调用（不带 sessionId）用它兜底；不缓存事件状态，
 * 避免可变全局与事件监听器。
 */
function recentSession(ctx) {
  const agents = ctx.get('agents')
  if (agents === undefined || agents === null || typeof agents.roots !== 'function') return undefined
  try {
    const roots = agents.roots()
    for (let i = roots.length - 1; i >= 0; i--) {
      const candidate = roots[i] && roots[i].session
      if (candidate !== undefined && candidate !== null) return candidate
    }
  } catch (err) { /* containment */ }
  return undefined
}

/**
 * 相对路径的基址：显式会话优先，其次实时最近根会话；都没有时交给 process.cwd()。
 * 会话存在但没有 cwd 时不借用其它会话（避免跨会话读路径）。
 */
function baseCwdFor(ctx, session) {
  if (session !== undefined) return cwdOf(session)
  return cwdOf(recentSession(ctx))
}

/** 让宿主 fs 写入与【会话策略】一致；旧调用取实时最近根会话的策略。 */
function sandboxPolicyFor(ctx, session) {
  const policy = ctx.get('sandboxPolicy')
  if (policy === undefined || policy === null || typeof policy.resolve !== 'function') return undefined
  if (session !== undefined) return policy.resolve({ session })
  const recent = recentSession(ctx)
  return recent === undefined ? policy.resolve() : policy.resolve({ session: recent })
}

/** 稳定版本令牌：后端不透明的 FsInfo.version，与 fsWrite 的陈旧守卫同族。 */
function versionOf(info) {
  if (!info) return null
  if (typeof info.version === 'string' && info.version !== '') return info.version
  return null
}

/** 把可能是相对路径的输入解析成绝对路径；旧调用没有会话时用 process.cwd()。 */
function toAbsolute(input, baseCwd) {
  if (typeof input !== 'string' || input.trim() === '') throw new Error('path is required')
  const candidate = input.trim()
  if (candidate.startsWith('/') || /^[A-Za-z]:[\\/]/.test(candidate) || /^\\\\[^\\]+\\/.test(candidate)) return candidate
  const base = (typeof baseCwd === 'string' && baseCwd !== '') ? baseCwd : process.cwd()
  return join(base, candidate)
}

/**
 * UTF-8 安全切片：n 落在代理对中间时回退一个字符，避免把 emoji 劈成两半。
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

/**
 * 工作区根。显式 session 时用该会话的 cwd；会话没有 cwd 时用部署默认根。
 * 旧调用（无 session）保持原有优先级：实时最近根会话 → 工作区注册表 → 部署默认。
 */
async function resolveWorkspaceRoot(ctx, session) {
  if (session !== undefined) {
    const cwd = cwdOf(session)
    if (cwd !== null) return cwd
    const policy = ctx.get('sandboxPolicy')
    if (policy !== undefined && policy !== null && typeof policy.workspaceRoot === 'string') return policy.workspaceRoot
    return null
  }
  const fallbackCwd = cwdOf(recentSession(ctx))
  if (fallbackCwd !== null) return fallbackCwd
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
 * 写入边界：目标必须落在该会话的工作区内。读操作不受限（官方预览也能读工作区
 * 外的文件），只有写入被约束。词法归一化 + realpath 复核，挡 `..` 穿越与链接逃逸。
 */
async function assertInsideWorkspace(filePath, root) {
  if (root === null || root === '' || root === undefined) {
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

/** fs 服务缺失统一报错。 */
function fsOf(ctx) {
  const fs = ctx.get('fs')
  if (fs === undefined) throw new Error('fs service unavailable')
  return fs
}

/**
 * fsStat/fsRead 共用的读取前置：path 校验、会话解析、路径解析、resolve、stat、
 * not found 检查。fsWrite 的边界检查顺序不同，单独走。
 */
async function resolveTarget(ctx, path, sessionId) {
  if (typeof path !== 'string' || path.trim() === '') throw new Error('path is required')
  const fs = fsOf(ctx)
  const session = sessionById(ctx, sessionId)
  const target = await fs.resolve(toAbsolute(path, baseCwdFor(ctx, session)))
  const info = await fs.stat(target)
  if (info === undefined) throw new Error('not found: ' + path)
  return { fs, target, info }
}

/** 当前宿主平台方言。 */
function hostPlatform() {
  return platformName(process.platform)
}

/** 原生分隔符的绝对路径，供客户端显示与写入剪贴板。 */
function nativePathOf(p) {
  return toNativePath(p, hostPlatform())
}

/**
 * 本地文件系统后端判定：只有本地/沙箱后端能安全执行 Node 级目录操作。
 * 远程/SSH 后端没有宿主进程路径，返回 false。
 */
function localBackendOf(fs) {
  if (fs === null || fs === undefined || typeof fs.processPathFromHostPath !== 'function') return false
  try {
    return fs.processPathFromHostPath(process.cwd()) !== undefined
  } catch (err) {
    return false
  }
}

/** Node 级目录操作的能力门槛。 */
function assertLocalBackend(fs) {
  if (!localBackendOf(fs)) {
    throw new Error('当前文件系统后端不支持此操作（仅本地文件系统可用）')
  }
}

/** 只读会话在进入任何 mutation 前就被拒绝。 */
function assertMutable(ctx, session) {
  const policy = sandboxPolicyFor(ctx, session)
  if (policy !== undefined && policy !== null && policy.mode === 'read-only') {
    throw new Error('当前会话的沙箱策略为只读，已拒绝修改')
  }
}

/**
 * 条目位置的工作区边界：与 fsWrite 的写入边界不同，这里比较「条目所在位置」
 * （父目录 realpath + basename），不跟随条目自身的符号链接。删除/重命名链接
 * 时只移动或删除链接本身，不会因为链接目标在区外而误判。
 */
async function assertEntryInsideWorkspace(entryPath, root) {
  if (root === null || root === '' || root === undefined) {
    throw new Error('无法确定工作区根目录，已拒绝操作：' + entryPath)
  }
  if (!isInsidePath(root, entryPath, hostPlatform())) {
    throw new Error('目标不在当前工作区内，已拒绝：' + entryPath)
  }
  const parent = dirname(entryPath)
  const rootReal = await canonicalPath(root)
  const parentReal = await canonicalPath(parent)
  const entryReal = normPath(join(parentReal, basename(entryPath)))
  if (!isInsidePath(rootReal, entryReal, hostPlatform())) {
    throw new Error('目标经符号链接/连接点解析后不在当前工作区内，已拒绝：' + entryPath)
  }
}

/** 后端 lstat 优先；本地后端缺失 lstat 时用 Node lstat 兜底。 */
async function entryLstat(fs, absolutePath) {
  if (typeof fs.lstat === 'function') {
    try {
      const info = await fs.lstat(absolutePath)
      if (info !== undefined) return info
    } catch (err) { /* fall through to Node */ }
  }
  if (localBackendOf(fs)) {
    try {
      const info = await nodeLstat(absolutePath)
      return {
        type: info.isSymbolicLink() ? 'symlink' : info.isDirectory() ? 'directory' : info.isFile() ? 'file' : 'other',
        size: info.size,
        version: null
      }
    } catch (err) { /* missing */ }
  }
  return undefined
}

/** 统一的 mutation 错误文案。 */
function mapMutationError(error, target) {
  if (!(error instanceof Error)) return new Error(String(error))
  const code = error.code
  if (code === 'FS_STALE_VERSION') return new Error('文件已被外部修改，请重试')
  if (code === 'FS_NOT_OBSERVED' || code === 'EEXIST') return new Error('同名文件/文件夹已存在：' + target)
  if (code === 'FS_SANDBOX_DENIED') return new Error('当前会话的沙箱策略不允许修改：' + target)
  if (code === 'FS_NOT_FOUND' || code === 'ENOENT') return new Error('文件已不存在：' + target)
  if (code === 'FS_NOT_DIRECTORY' || code === 'ENOTDIR') return new Error('目标不是文件夹：' + target)
  if (code === 'FS_NOT_REGULAR_FILE' || code === 'EISDIR') return new Error('目标是文件夹，不是普通文件：' + target)
  if (code === 'FS_PERMISSION_DENIED' || code === 'EACCES' || code === 'EPERM') {
    return new Error('没有权限修改（可能被占用或只读）：' + target)
  }
  if (code === 'EBUSY') return new Error('文件正被其它程序占用：' + target)
  if (code === 'EXDEV') return new Error('不支持跨磁盘操作')
  if (code === 'ENAMETOOLONG') return new Error('路径或文件名过长')
  if (code === 'EROFS') return new Error('只读文件系统')
  return error
}

/** 校验名称，失败时抛统一错误。 */
function checkedName(name) {
  const result = validateEntryName(name, hostPlatform())
  if (!result.ok) throw new Error(result.message)
  return result.name
}

/** 解析一个已存在的目录，返回绝对路径与 info。 */
async function requireDirectory(fs, directory, base) {
  const absolute = resolve(toAbsolute(directory, base))
  const info = await fs.stat(await fs.resolve(absolute))
  if (info === undefined) throw new Error('父目录不存在：' + directory)
  if (info.type !== 'directory') throw new Error('父目录不是文件夹：' + directory)
  return absolute
}

class FileExplorerService extends TypertRemoteService {
  constructor(ctx) {
    super(ctx, 'fileExplorer')
  }

  /** 元数据 + 版本令牌。编辑页用它轮询"磁盘上的文件是否被外部改过"。 */
  async fsStat(path, sessionId) {
    const { info } = await resolveTarget(this.ctx, path, sessionId)
    return {
      type: info.type,
      size: info.size === undefined ? null : info.size,
      version: versionOf(info)
    }
  }

  /**
   * 读一段文本。返回大小、版本令牌、是否截断、是否二进制，以及 decodeValid：
   * 文本里是否出现了 U+FFFD 替换字符。为 false 表示这些字节**不是合法 UTF-8**
   * （GBK / UTF-16 / CP1252 等旧编码），客户端必须拒绝编辑——否则用户会在乱码上改，
   * 写回时把原文件彻底毁掉。
   */
  async fsRead(path, maxBytes, sessionId) {
    let limit = MAX_TEXT_BYTES
    if (typeof maxBytes === 'number' && Number.isFinite(maxBytes)) {
      limit = Math.min(Math.max(Math.floor(maxBytes), 1024), MAX_TEXT_BYTES)
    }
    const { fs, target, info } = await resolveTarget(this.ctx, path, sessionId)
    if (info.type !== 'file') throw new Error('not a file: ' + path)
    const result = { size: info.size === undefined ? null : info.size, version: versionOf(info) }
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
   * expectedVersion 存在时把期望版本作为 { kind: 'replaceIfVersion' } 意图交给
   * writeText：缺失/不匹配由宿主在同一临界区抛 FS_STALE_VERSION，校验与写入之间
   * 没有竞态窗口。前置 stat 比对只为给出更友好的报错。expectedVersion 为空
   * （新文件）时保持无条件写入。
   *
   * sessionId 决定工作区根（写入边界）与沙箱策略（mode/root），两者都取同一个会话。
   */
  async fsWrite(path, content, expectedVersion, sessionId) {
    if (typeof content !== 'string') throw new Error('content must be a string')
    const fs = fsOf(this.ctx)
    const session = sessionById(this.ctx, sessionId)
    const filePath = toAbsolute(path, baseCwdFor(this.ctx, session))
    const root = await resolveWorkspaceRoot(this.ctx, session)
    await assertInsideWorkspace(filePath, root)
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
        sandboxPolicyFor(this.ctx, session)
      )
      return { version: outcome.version }
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

  /** 宿主平台与 mutation 能力探测；客户端据 localBackend 决定是否显示文件夹操作。 */
  async fsEnvironment(sessionId) {
    const session = sessionById(this.ctx, sessionId)
    const root = await resolveWorkspaceRoot(this.ctx, session)
    const cwd = root !== null && root !== undefined ? root : baseCwdFor(this.ctx, session)
    const fs = this.ctx.get('fs')
    const platform = hostPlatform()
    return {
      platform,
      separator: platform === 'win32' ? '\\' : '/',
      caseSensitive: platform === 'linux',
      localBackend: fs === undefined ? false : localBackendOf(fs),
      cwd: typeof cwd === 'string' && cwd !== '' ? cwd : null,
      workspaceRoot: typeof root === 'string' && root !== '' ? root : null
    }
  }

  /**
   * 只读描述。不抛“不存在”：missing 也是合法结果，删除/重命名对话框据此
   * 显示禁用与版本守卫。relative 越界为 null。
   */
  async fsDescribe(path, sessionId) {
    if (typeof path !== 'string' || path.trim() === '') throw new Error('path is required')
    const fs = fsOf(this.ctx)
    const session = sessionById(this.ctx, sessionId)
    const base = baseCwdFor(this.ctx, session)
    const absolute = resolve(toAbsolute(path, base))
    const root = await resolveWorkspaceRoot(this.ctx, session)
    let insideWorkspace = false
    try {
      await assertEntryInsideWorkspace(absolute, root)
      insideWorkspace = true
    } catch (err) { /* outside is a valid describe result */ }
    let exists = false
    let kind = null
    let version = null
    let size = null
    let link = false
    const linkInfo = await entryLstat(fs, absolute)
    if (linkInfo !== undefined) {
      link = linkInfo.type === 'symlink'
      exists = true
      kind = linkInfo.type
      version = versionOf(linkInfo)
      size = linkInfo.size === undefined ? null : linkInfo.size
    }
    if (!link) {
      try {
        const info = await fs.stat(await fs.resolve(absolute))
        if (info !== undefined) {
          exists = true
          kind = info.type
          version = versionOf(info) !== null ? versionOf(info) : version
          size = info.size === undefined ? size : info.size
        }
      } catch (err) { /* missing parent / unreadable */ }
    }
    const relativeRoot = typeof root === 'string' && root !== '' ? root : base
    return {
      absolute,
      native: nativePathOf(absolute),
      relative: relativePath(relativeRoot, absolute, hostPlatform()),
      name: basename(absolute),
      directory: dirname(absolute),
      kind,
      exists,
      link,
      insideWorkspace,
      version,
      size
    }
  }

  /** 在当前目录下新建空文件；createIfAbsent 原子防覆盖。 */
  async fsCreateFile(directory, name, sessionId) {
    const checked = checkedName(name)
    const fs = fsOf(this.ctx)
    const session = sessionById(this.ctx, sessionId)
    const base = baseCwdFor(this.ctx, session)
    const root = await resolveWorkspaceRoot(this.ctx, session)
    assertMutable(this.ctx, session)
    const dirAbs = await requireDirectory(fs, directory, base)
    const filePath = join(dirAbs, checked)
    await assertEntryInsideWorkspace(filePath, root)
    try {
      const outcome = await fs.writeText(
        await fs.resolve(filePath),
        '',
        { kind: 'createIfAbsent' },
        undefined,
        sandboxPolicyFor(this.ctx, session)
      )
      return {
        path: nativePathOf(filePath),
        name: checked,
        version: outcome && outcome.version ? outcome.version : null
      }
    } catch (err) {
      throw mapMutationError(err, filePath)
    }
  }

  /** 在当前目录下新建空文件夹；仅本地后端。 */
  async fsCreateFolder(directory, name, sessionId) {
    const checked = checkedName(name)
    const fs = fsOf(this.ctx)
    const session = sessionById(this.ctx, sessionId)
    const base = baseCwdFor(this.ctx, session)
    const root = await resolveWorkspaceRoot(this.ctx, session)
    assertMutable(this.ctx, session)
    assertLocalBackend(fs)
    const dirAbs = await requireDirectory(fs, directory, base)
    const folderPath = join(dirAbs, checked)
    await assertEntryInsideWorkspace(folderPath, root)
    try {
      await nodeMkdir(folderPath)
    } catch (err) {
      throw mapMutationError(err, folderPath)
    }
    return { path: nativePathOf(folderPath), name: checked }
  }

  /** 同目录内重命名；文件与文件夹都支持，仅本地后端。 */
  async fsRename(path, newName, sessionId) {
    const checked = checkedName(newName)
    const fs = fsOf(this.ctx)
    const session = sessionById(this.ctx, sessionId)
    const base = baseCwdFor(this.ctx, session)
    const root = await resolveWorkspaceRoot(this.ctx, session)
    assertMutable(this.ctx, session)
    assertLocalBackend(fs)
    const source = resolve(toAbsolute(path, base))
    if (normPath(source) === normPath(root)) throw new Error('不能重命名当前工作目录')
    await assertEntryInsideWorkspace(source, root)
    const destination = join(dirname(source), checked)
    if (source === destination) {
      return { path: nativePathOf(source), name: checked, previousPath: nativePathOf(source) }
    }
    await assertEntryInsideWorkspace(destination, root)
    let sourceInfo
    try {
      sourceInfo = await nodeLstat(source, { bigint: true })
    } catch (err) {
      throw new Error('文件已不存在：' + path)
    }
    try {
      const destinationInfo = await nodeLstat(destination, { bigint: true })
      if (destinationInfo.dev !== sourceInfo.dev || destinationInfo.ino !== sourceInfo.ino) {
        throw new Error('同名文件/文件夹已存在：' + checked)
      }
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('同名')) throw err
      if (err && err.code !== 'ENOENT' && err.code !== 'ENOTDIR') throw mapMutationError(err, destination)
    }
    try {
      await nodeRename(source, destination)
    } catch (err) {
      throw mapMutationError(err, destination)
    }
    return { path: nativePathOf(destination), name: checked, previousPath: nativePathOf(source) }
  }

  /**
   * 删除文件（仅普通文件）。符号链接在本地后端只删链接本身；目录明确拒绝。
   * expectedVersion 由对话框从 fsDescribe 取得，防止删掉已被外部改过的文件。
   */
  async fsDelete(path, expectedVersion, sessionId) {
    const fs = fsOf(this.ctx)
    const session = sessionById(this.ctx, sessionId)
    const base = baseCwdFor(this.ctx, session)
    const root = await resolveWorkspaceRoot(this.ctx, session)
    assertMutable(this.ctx, session)
    const absolute = resolve(toAbsolute(path, base))
    if (normPath(absolute) === normPath(root)) throw new Error('不能删除当前工作目录')
    await assertEntryInsideWorkspace(absolute, root)
    const linkInfo = await entryLstat(fs, absolute)
    if (linkInfo !== undefined && linkInfo.type === 'symlink') {
      assertLocalBackend(fs)
      try {
        await nodeUnlink(absolute)
      } catch (err) {
        throw mapMutationError(err, absolute)
      }
      return { path: nativePathOf(absolute), name: basename(absolute) }
    }
    const target = await fs.resolve(absolute)
    const info = await fs.stat(target)
    if (info === undefined) throw new Error('文件已不存在：' + path)
    if (info.type !== 'file') throw new Error('只支持删除文件，文件夹暂不支持删除')
    const expected = typeof expectedVersion === 'string' && expectedVersion !== ''
      ? { version: expectedVersion }
      : undefined
    try {
      await fs.deleteFile(target, expected, undefined, sandboxPolicyFor(this.ctx, session))
    } catch (err) {
      throw mapMutationError(err, absolute)
    }
    return { path: nativePathOf(absolute), name: basename(absolute) }
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
  // Equivalent to @Remote(method) on the class method.
  Remote(method)(undefined, context)
  context.cb.call(Object.create(proto))
}
markRemote('fsStat')
markRemote('fsRead')
markRemote('fsWrite')
markRemote('fsEnvironment')
markRemote('fsDescribe')
markRemote('fsCreateFile')
markRemote('fsCreateFolder')
markRemote('fsRename')
markRemote('fsDelete')

export function apply(ctx) {
  // TypertRemoteService 在构造器里注册 fileExplorer 并设置 typertRemote；
  // 网关的 source-mode 发现同时消费这两者。
  new FileExplorerService(ctx)
}
