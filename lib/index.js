// dsh-file-explorer — Host half (persistent).
//
// Registers the `fileExplorer` Remote service for the web Client half.
// The Client calls it through the Typert Gateway (`/api` RPC):
//   1. `ctx.reflect.props`   — service registration (done by the TypertRemoteService
//                              superclass constructor via `ctx.reflect.provide`).
//   2. `typertRemote`        — wire binding { service, serviceKey, namespace } (also
//                              set by the superclass constructor).
//   3. `remoteMethods()`     — private markers on the prototype. Applied WITHOUT
//                              decorator syntax (Node 24 rejects stage-3 decorators
//                              by default) through the manual decorator-context trick
//                              below, equivalent to `@Remote('name')` on each method.
//
// IMPORTANT: the Gateway derives parameter wires from the method SOURCE (parameter
// names must be simple identifiers — no destructuring, defaults, or rest), and the
// client-side contribution matches them positionally.

import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { writeFile, mkdir, rename, copyFile, cp, stat, rm, readdir, realpath } from 'node:fs/promises'
import { dirname, join, basename, resolve } from 'node:path'
import { execFile } from 'node:child_process'
import { homedir } from 'node:os'
import { detectKind, renderMarkdown, highlightLines, windowText, safeSlice, MAX_RENDER_LINES } from './render.js'

const DEFAULT_MAX_BYTES = 512 * 1024
// v1.9.0: 预览上限 2MB → 4MB（配合「继续加载」分段续读，超限不再只是截断）
const MAX_BYTES_CAP = 4 * 1024 * 1024
const DELETE_TIMEOUT_MS = 60 * 1000
const INTERNAL_TRASH_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
const INTERNAL_TRASH_MAX_ITEMS = 200
// v1.9.7: 截断文件总行数统计缓存（path@version → {lines, endsWithNewline}），
// FIFO 上限防止浏览大量大文件时无界增长。
const TOTAL_LINES_CACHE_MAX = 64
const totalLinesCache = new Map()

/** Run an external command; resolves when it exits 0, rejects with stderr/stdout detail. */
function runShell(command, args, label) {
  return new Promise((resolve, reject) => {
    execFile(command, args, {
      timeout: DELETE_TIMEOUT_MS,
      windowsHide: true
    }, (error, stdout, stderr) => {
      if (error) {
        const detail = String(stderr || stdout || error.message).trim()
        reject(new Error(`${label}: ${detail || error.message}`))
        return
      }
      resolve(true)
    })
  })
}

/** Move a file or directory into the OS recycle bin (Windows PowerShell). */
function deleteToRecycleBin(filePath, isDir) {
  const escaped = String(filePath).replace(/'/g, "''")
  const method = isDir ? 'DeleteDirectory' : 'DeleteFile'
  const script =
    `Add-Type -AssemblyName Microsoft.VisualBasic; ` +
    `[Microsoft.VisualBasic.FileIO.FileSystem]::${method}('${escaped}','OnlyErrorDialogs','SendToRecycleBin')`
  return runShell('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], 'recycle bin failed')
}

/** Move to the macOS trash via Finder (osascript). */
function deleteToMacTrash(filePath) {
  const escaped = String(filePath).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  const script = `tell application "Finder" to delete POSIX file "${escaped}"`
  return runShell('osascript', ['-e', script], 'macOS trash failed')
}

/** Move to the XDG trash via `gio trash` (Linux). */
function deleteToXdgTrash(filePath) {
  return runShell('gio', ['trash', String(filePath)], 'gio trash failed')
}

/** Fallback trash: move into `~/.dsh-file-explorer-trash/` with a timestamp name. */
async function deleteToInternalTrash(filePath) {
  const trashRoot = join(homedir(), '.dsh-file-explorer-trash')
  await mkdir(trashRoot, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const target = join(trashRoot, stamp + '-' + basename(filePath))
  await rename(filePath, target)
  // Fire-and-forget housekeeping: keep the fallback trash from growing forever.
  cleanupInternalTrash().catch(() => {})
  return target
}

/**
 * Enforce the internal-trash retention policy: entries older than 30 days are
 * removed, and the newest 200 entries are kept when the bucket overflows.
 * Runs best-effort (never throws).
 */
async function cleanupInternalTrash() {
  const trashRoot = join(homedir(), '.dsh-file-explorer-trash')
  let entries
  try {
    entries = await readdir(trashRoot, { withFileTypes: true })
  } catch (err) {
    return // trash dir missing or unreadable — nothing to do
  }
  const items = []
  for (const entry of entries) {
    const full = join(trashRoot, entry.name)
    try {
      const info = await stat(full)
      items.push({ name: entry.name, full, mtimeMs: info.mtimeMs, isDir: entry.isDirectory() })
    } catch (err) {
      /* unreadable entry — leave it alone */
    }
  }
  // 降序：最新在前。保留"最新"的 INTERNAL_TRASH_MAX_ITEMS 项，先删过期的
  // 与超出上限的"旧"项（升序会导致保留最旧、删除最新的反转行为）。
  items.sort((a, b) => b.mtimeMs - a.mtimeMs)
  const now = Date.now()
  let kept = 0
  for (const item of items) {
    const expired = now - item.mtimeMs > INTERNAL_TRASH_MAX_AGE_MS
    const overCap = kept >= INTERNAL_TRASH_MAX_ITEMS
    if (expired || overCap) {
      await rm(item.full, { recursive: item.isDir, force: true }).catch(() => {})
    } else {
      kept += 1
    }
  }
}

// Most-recent workspace signals, shared by the service methods (one host instance).
let runningCwd = null
let recentCwd = null

function cwdOf(session) {
  if (session && session.header && typeof session.header.cwd === 'string' && session.header.cwd !== '') {
    return session.header.cwd
  }
  return null
}

/**
 * Stable version token for a file. Under 0.1.2 dsh-fs (ctx.fs) the token is the
 * backend's opaque FsInfo.version (`dev:ino:size:mtimeNs:ctimeNs`) — the SAME
 * family fsWrite's stale guard compares against. The mtimeMs|size fallback is
 * kept only for direct node:fs Stats callers (pre-0.1.2 shape); versionOf
 * returns null for anything foreign, which gracefully disables the guard.
 */
function versionOf(info) {
  if (!info) return null
  if (typeof info.version === 'string' && info.version !== '') return info.version
  if (typeof info.mtimeMs !== 'number' || typeof info.size !== 'number') return null
  return String(info.mtimeMs) + '|' + String(info.size)
}

/** Resolve a possibly-relative input path against the host cwd. */
function toAbsolute(input) {
  if (typeof input !== 'string' || input.trim() === '') throw new Error('path is required')
  const candidate = input.trim()
  if (candidate.startsWith('/') || /^[A-Za-z]:[\\/]/.test(candidate) || /^\\\\[^\\]+\\/.test(candidate)) return candidate
  const base = runningCwd || recentCwd || process.cwd()
  return join(base, candidate)
}

/** Ensure the parent directory of a path exists. */
async function ensureParentDir(filePath) {
  const parent = dirname(filePath)
  if (parent && parent !== filePath) await mkdir(parent, { recursive: true })
}

/**
 * Reject moving/copying a path into itself or one of its descendants
 * (which would recurse or corrupt the tree). Case-insensitive on Windows.
 * v1.9.21: 先做词法归一化（resolve 消解 `..`/`.`）——含 `..` 的原始路径
 * 会骗过字符串前缀检查并把目标解析到工作区之外。
 */
function assertNoSelfNesting(fromPath, destDir, verb) {
  const sep = process.platform === 'win32' ? '\\' : '/'
  const norm = (p) => {
    const trimmed = resolve(p).replace(/[\\/]+$/, '')
    return process.platform === 'win32' ? trimmed.toLowerCase() : trimmed
  }
  const from = norm(fromPath)
  const dest = norm(destDir)
  if (dest === from) throw new Error(`cannot ${verb} a path into itself`)
  if (dest.startsWith(from + sep)) throw new Error(`cannot ${verb} a directory into its own subdirectory`)
}

/**
 * Normalize a path for containment checks: strip a trailing separator and
 * lower-case on Windows (drive letters and case-insensitive filesystem).
 */
function normPath(p) {
  const trimmed = String(p).replace(/[\\/]+$/, '')
  return process.platform === 'win32' ? trimmed.toLowerCase() : trimmed
}

/**
 * v1.10.1: 规范化到「真实路径」再做包含性比较。词法 resolve 不跟随符号链接
 * 与 Windows junction——工作区内指向外部的链接（或经链接访问外部目标）会
 * 骗过前缀比较；realpath 展开链接后比较才是权威判定。目标尚不存在时
 * （新建/改名目标）回退到「父目录 realpath + basename」；探测失败时回退
 * 词法形式（保持旧行为，不因探测故障拒绝操作）。
 */
async function canonicalPath(p) {
  try {
    return normPath(await realpath(p))
  } catch (err) {
    try {
      const parent = dirname(p)
      if (parent && parent !== p) {
        return normPath(join(await realpath(parent), basename(p)))
      }
    } catch (err2) { /* fall through to lexical */ }
  }
  return normPath(resolve(p))
}

/**
 * Resolve the current workspace root (async — may consult agent sessions /
 * the workspace registry / the sandbox policy). Returns null when unknown.
 * Every probe is error-contained: a rejecting service must not break the
 * caller (single source of truth for wsRoot() and the mutation boundary).
 */
async function resolveWorkspaceRoot(ctx) {
  const agents = ctx.get('agents')
  if (agents !== undefined) {
    try {
      const roots = agents.roots()
      for (let i = roots.length - 1; i >= 0; i--) {
        const agent = roots[i]
        const cwd = cwdOf(agent && agent.session)
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
 * Enforce the destructive-operation boundary: the target must live under the
 * current workspace root. Throws when the root is unknown or the path escapes
 * it. Read-only operations (fsList/fsRead) intentionally stay unrestricted so
 * users can preview files outside the workspace; every mutation is confined.
 */
async function assertInsideWorkspace(ctx, filePath) {
  const root = await resolveWorkspaceRoot(ctx)
  if (root === null || root === '') {
    throw new Error('无法确定工作区根目录，已拒绝文件操作：' + filePath)
  }
  // v1.9.21: 词法归一化后再比较——原始路径可能含 `..`/`.` 段，直接前缀
  // 比较会放行 resolve 后实际落在工作区之外的目标（目录穿越）。
  const rootNorm = normPath(resolve(root))
  const pathNorm = normPath(resolve(filePath))
  const sep = process.platform === 'win32' ? '\\' : '/'
  if (pathNorm !== rootNorm && !pathNorm.startsWith(rootNorm + sep)) {
    throw new Error('目标不在当前工作区内，已拒绝：' + filePath)
  }
  // v1.10.1: 真实路径复核——词法比较通过但经符号链接/junction 解析后逃逸
  // 的目标在此被拦截（工作区根自身若为链接，realpath 后两侧同源展开）。
  const rootReal = await canonicalPath(root)
  const pathReal = await canonicalPath(filePath)
  if (pathReal !== rootReal && !pathReal.startsWith(rootReal + sep)) {
    throw new Error('目标经符号链接/连接点解析后不在当前工作区内，已拒绝：' + filePath)
  }
}

/**
 * Refuse mutations that would damage the workspace root itself: deleting it
 * would send the entire workspace to the trash, renaming/moving it would
 * break the running session's cwd and every follow path.
 */
async function assertNotWorkspaceRoot(ctx, filePath) {
  const root = await resolveWorkspaceRoot(ctx)
  if (root !== null && root !== '' && normPath(resolve(root)) === normPath(resolve(filePath))) {
    throw new Error('不能对工作区根目录执行该操作：' + filePath)
  }
  // v1.10.1: 真实路径复核（链接别名指向根目录同样拒绝）。
  if (root !== null && root !== '' && (await canonicalPath(root)) === (await canonicalPath(filePath))) {
    throw new Error('不能对工作区根目录执行该操作：' + filePath)
  }
}

/** `file (N).ext`-style unique target name; dotfiles keep their leading dot. */
async function uniqueTargetName(destDir, base, probe) {
  const dot = base.lastIndexOf('.')
  const stem = dot > 0 ? base.slice(0, dot) : base
  const ext = dot > 0 ? base.slice(dot) : ''
  let target = join(destDir, base)
  for (let counter = 1; (await probe(target).catch(() => null)) !== null; counter += 1) {
    target = join(destDir, `${stem} (${counter})${ext}`)
  }
  return target
}

class FileExplorerService extends TypertRemoteService {
  constructor(ctx) {
    super(ctx, 'fileExplorer')
  }

  async fsList(path) {
    const fs = this.ctx.get('fs')
    if (fs === undefined) throw new Error('fs service unavailable')
    if (typeof path !== 'string' || path.trim() === '') throw new Error('path is required')
    const target = await fs.resolve(path)
    const info = await fs.stat(target)
    if (info === undefined) throw new Error('not found: ' + path)
    if (info.type !== 'directory') throw new Error('not a directory: ' + path)
    const entries = await fs.listDir(target)
    return {
      path: fs.processPath(target),
      display: target.displayPath,
      entries: entries.map((e) => ({
        name: e.name,
        type: e.type,
        size: e.size === undefined ? null : e.size,
        path: fs.processPath(e.target)
      }))
    }
  }

  async fsRead(path, maxBytes) {
    const fs = this.ctx.get('fs')
    if (fs === undefined) throw new Error('fs service unavailable')
    if (typeof path !== 'string' || path.trim() === '') throw new Error('path is required')
    let limit = DEFAULT_MAX_BYTES
    if (typeof maxBytes === 'number' && Number.isFinite(maxBytes)) {
      limit = Math.min(Math.max(Math.floor(maxBytes), 1024), MAX_BYTES_CAP)
    }
    const target = await fs.resolve(path)
    const info = await fs.stat(target)
    if (info === undefined) throw new Error('not found: ' + path)
    if (info.type !== 'file') throw new Error('not a file: ' + path)
    const size = info.size === undefined ? null : info.size
    const result = { path: fs.processPath(target), size, version: versionOf(info) }
    try {
      // Stream the text so oversized files never load fully into memory; stop at
      // `limit` characters (v1.10.1: `limit`/DEFAULT_MAX_BYTES/MAX_BYTES_CAP 命名
      // 为字节预算，但实际是【字符】窗口——streamText 输出为解码后的字符串，
      // windowText 的 limit 也是字符数；命名仅作对齐标记，行为按字符计) and mark
      // the preview truncated. The backend raises FS_NOT_TEXT when the sample
      // contains NUL — that is the binary signal.
      let text = ''
      let truncated = false
      if (typeof fs.streamText === 'function') {
        // v1.10.1: 多读 1 字符再判定截断——文件恰好等于 limit 字符时不再误标
        // 「已截断」（旧 `>= limit` 在精确命中边界时误报，UI 多出一个空转的
        // 「继续加载」）；读满 limit+1 才说明文件确实还有内容。
        const cap = limit + 1
        const stream = await fs.streamText(target)
        for await (const chunk of stream) {
          if (text.length >= cap) break
          const need = cap - text.length
          text += chunk.length > need ? safeSlice(chunk, need) : chunk
        }
        if (text.length > limit) {
          text = text.slice(0, limit)
          truncated = true
        }
      } else {
        text = await fs.readText(target)
        if (text.length > limit) {
          text = text.slice(0, limit)
          truncated = true
        }
      }
      return Object.assign(result, { truncated, text })
    } catch (err) {
      if (err && err.code === 'FS_NOT_TEXT') return Object.assign(result, { binary: true })
      throw err
    }
  }

  /**
   * v1.10.1: 渲染预览：按文件类型返回 Markdown 富文本 / 逐行高亮代码 / 纯文本。
   * 支持 offset 续读（「继续加载」）：offsetChars 为字符偏移（续读时从断点
   * 继续流式读取），offsetLines 为已读行数（客户端行号累计——预留字段，当前
   * 未在签名中使用，客户端仅按 offsetChars 续读）。
   * 分层：≤MAX_RENDER_LINES 行返回高亮 lines[]；否则返回原样 text（客户端
   * 虚拟化渲染，不高亮）。单文件超 MAX_BYTES_CAP 时 truncated=true + totalLines。
   */
  async fsRender(path, maxBytes, offsetChars) {
    const fs = this.ctx.get('fs')
    if (fs === undefined) throw new Error('fs service unavailable')
    if (typeof path !== 'string' || path.trim() === '') throw new Error('path is required')
    let limit = DEFAULT_MAX_BYTES
    if (typeof maxBytes === 'number' && Number.isFinite(maxBytes)) {
      limit = Math.min(Math.max(Math.floor(maxBytes), 1024), MAX_BYTES_CAP)
    }
    const offset = typeof offsetChars === 'number' && Number.isFinite(offsetChars) && offsetChars > 0 ? Math.floor(offsetChars) : 0
    const target = await fs.resolve(path)
    const info = await fs.stat(target)
    if (info === undefined) throw new Error('not found: ' + path)
    if (info.type !== 'file') throw new Error('not a file: ' + path)
    const size = info.size === undefined ? null : info.size
    const result = { path: fs.processPath(target), size, version: versionOf(info), offsetChars: offset }
    try {
      // 流式收集窗口所需字符块；cap 多取 1 字符让 windowText 能判定 truncated
      // （文件还有更多内容）——恰好读满 limit 时截断信号不能丢
      const chunks = []
      const stream = typeof fs.streamText === 'function' ? await fs.streamText(target) : null
      if (stream !== null) {
        let acc = 0
        const cap = offset + limit + 1
        for await (const chunk of stream) {
          if (acc >= cap) break
          const need = cap - acc
          chunks.push(chunk.length > need ? safeSlice(chunk, need) : chunk)
          acc += chunk.length > need ? need : chunk.length
        }
      } else {
        chunks.push(await fs.readText(target))
      }
      const windowed = windowText(chunks, offset, limit)
      const text = windowed.text
      const truncated = windowed.truncated
      const kindInfo = offset > 0
        ? { kind: 'text', language: null } // 续读片段不重新判定类型（客户端沿用首段）
        : detectKind(basename(fs.processPath(target)), text)
      const lineCount = text === '' ? 0 : text.split('\n').length
      const base = Object.assign(result, { kind: kindInfo.kind, language: kindInfo.language, lineCount, truncated })
      if (truncated) {
        // 统计文件总行数（流式数 \n，不载入内存）——「已显示前 N 行/共 M 行」。
        // 按 path@version 缓存：同一文件版本只统计一次，避免每次「继续加载」
        // 都把整个文件重读一遍（大文件下是 O(n²)）；版本变化自动失效。
        const cacheKey = fs.processPath(target) + '@' + (versionOf(info) || '')
        let counted = totalLinesCache.get(cacheKey)
        if (counted === undefined && stream !== null) {
          let lines = 0
          let endsWithNewline = true
          try {
            const full = await fs.streamText(target)
            for await (const chunk of full) {
              if (chunk.length > 0) endsWithNewline = chunk[chunk.length - 1] === '\n'
              for (let i = 0; i < chunk.length; i += 1) {
                if (chunk.charCodeAt(i) === 10) lines += 1
              }
            }
            counted = { lines, endsWithNewline }
            if (totalLinesCache.size >= TOTAL_LINES_CACHE_MAX) {
              const oldest = totalLinesCache.keys().next().value
              if (oldest !== undefined) totalLinesCache.delete(oldest)
            }
            totalLinesCache.set(cacheKey, counted)
          } catch (err) { /* 统计失败则缺省 */ }
        }
        // 行数 = 换行数 +（未以换行结尾 ? 1 : 0）；整文件无换行视为 1 行。
        const totalLines = counted === undefined
          ? undefined
          : counted.lines === 0 ? 1 : counted.lines + (counted.endsWithNewline ? 0 : 1)
        return Object.assign(base, totalLines === undefined ? {} : { totalLines }, { text })
      }
      if (kindInfo.kind === 'markdown') {
        const rendered = renderMarkdown(text)
        // text 一并返回：客户端「源码」视图与编辑模式需要原始文本
        return Object.assign(base, { html: rendered.html, toc: rendered.toc, text })
      }
      if (kindInfo.kind === 'code' && lineCount <= MAX_RENDER_LINES) {
        return Object.assign(base, { lines: highlightLines(text, kindInfo.language), text })
      }
      return Object.assign(base, { text })
    } catch (err) {
      if (err && err.code === 'FS_NOT_TEXT') return Object.assign(result, { binary: true })
      throw err
    }
  }

  /**
   * Write text content to a file (creates or overwrites). When `expectedVersion`
   * is supplied, the write is refused if the file changed since it was read.
   * v1.9.21: the read/write both go through ctx.fs so the version token family
   * matches — fsRender/fsRead now return the backend's opaque FsVersion, and a
   * node:fs stat-based mtimeMs|size token would never compare equal (saves would
   * always fail, or the guard silently disabled when the token was null).
   */
  async fsWrite(path, content, expectedVersion) {
    if (typeof content !== 'string') throw new Error('content must be a string')
    const fs = this.ctx.get('fs')
    if (fs === undefined) throw new Error('fs service unavailable')
    const filePath = toAbsolute(path)
    await assertInsideWorkspace(this.ctx, filePath)
    const target = await fs.resolve(filePath)
    /* v1.10.1: 陈旧守卫改为【宿主同一临界区校验】——把期望版本作为
       { kind: 'replaceIfVersion' } 意图传给 writeText：缺失/不匹配由宿主抛
       FS_STALE_VERSION，校验与写入之间不再有竞态窗口（原实现是先 stat 比对、
       再 writeText，check-then-write 可被并发写入覆盖）。前置 stat/比对仅保留
       用于给出友好中文文案；原子路径兜底。无 expectedVersion（新文件保存）时
       保持无条件写入（与旧行为一致）。 */
    if (typeof expectedVersion === 'string' && expectedVersion !== '') {
      const info = await fs.stat(target)
      if (info === undefined) throw new Error('file no longer exists: ' + filePath)
      if (versionOf(info) !== expectedVersion) throw new Error('file changed on disk since it was opened; reload and try again')
      try {
        const outcome = await fs.writeText(target, content, { kind: 'replaceIfVersion', version: expectedVersion })
        const after = await fs.stat(target)
        return { path: fs.processPath(target), version: outcome.version, size: after ? after.size : null }
      } catch (err) {
        if (err && (err.code === 'FS_STALE_VERSION' || err.code === 'FS_NOT_FOUND')) {
          throw new Error('file changed on disk since it was opened; reload and try again')
        }
        throw err
      }
    }
    const outcome = await fs.writeText(target, content)
    const after = await fs.stat(target)
    return { path: fs.processPath(target), version: outcome.version, size: after ? after.size : null }
  }

  /** Create a new file or directory. Refuses when the target already exists. */
  async fsCreate(path, type, content) {
    const filePath = toAbsolute(path)
    await assertInsideWorkspace(this.ctx, filePath)
    if (type === 'dir') {
      const existing = await stat(filePath).catch(() => null)
      if (existing !== null) throw new Error('already exists: ' + filePath)
      await ensureParentDir(filePath)
      await mkdir(filePath)
      return { path: filePath, type: 'dir' }
    }
    if (type !== 'file') throw new Error('type must be "file" or "dir"')
    /* v1.10.1: 新建文件走宿主契约的原子 createIfAbsent 意图（同临界区拒绝已
       存在目标、经 fs-sandbox 围栏、记录 fs/observed）；父目录创建仍用 node:fs
       （宿主 fs 无 mkdir 动词）。 */
    const fs = this.ctx.get('fs')
    if (fs !== undefined) {
      const target = await fs.resolve(filePath)
      await ensureParentDir(filePath)
      try {
        await fs.writeText(target, typeof content === 'string' ? content : '', { kind: 'createIfAbsent' })
        const info = await fs.stat(target)
        return { path: fs.processPath(target), type: 'file', size: info ? info.size : null }
      } catch (err) {
        if (err && (err.code === 'FS_NOT_OBSERVED' || err.code === 'FS_EXISTS')) {
          throw new Error('already exists: ' + filePath)
        }
        throw err
      }
    }
    const existing = await stat(filePath).catch(() => null)
    if (existing !== null) throw new Error('already exists: ' + filePath)
    await ensureParentDir(filePath)
    await writeFile(filePath, typeof content === 'string' ? content : '', 'utf8')
    const info = await stat(filePath).catch(() => null)
    return { path: filePath, type: 'file', size: info ? info.size : null }
  }

  /** Rename or move a file/directory. Refuses when the destination exists. */
  async fsRename(from, to) {
    const fromPath = toAbsolute(from)
    const toPath = toAbsolute(to)
    await assertInsideWorkspace(this.ctx, fromPath)
    await assertInsideWorkspace(this.ctx, toPath)
    await assertNotWorkspaceRoot(this.ctx, fromPath)
    const source = await stat(fromPath).catch(() => null)
    if (source === null) throw new Error('not found: ' + fromPath)
    const dest = await stat(toPath).catch(() => null)
    if (dest !== null) throw new Error('already exists: ' + toPath)
    assertNoSelfNesting(fromPath, dirname(toPath), 'rename')
    await ensureParentDir(toPath)
    await rename(fromPath, toPath)
    return { from: fromPath, to: toPath }
  }

  /**
   * Copy a file or directory into a destination directory. Same-name targets get
   * a ` (N)` style numeric suffix (dotfiles keep their leading dot). Refuses to
   * copy a directory into itself or its own subtree.
   */
  async fsCopy(from, toDir) {
    const fromPath = toAbsolute(from)
    const destDir = toAbsolute(toDir)
    await assertInsideWorkspace(this.ctx, fromPath)
    await assertInsideWorkspace(this.ctx, destDir)
    const source = await stat(fromPath).catch(() => null)
    if (source === null) throw new Error('not found: ' + fromPath)
    const destInfo = await stat(destDir).catch(() => null)
    if (destInfo === null || destInfo.isDirectory() !== true) throw new Error('not a directory: ' + destDir)
    assertNoSelfNesting(fromPath, destDir, 'copy')
    const target = await uniqueTargetName(destDir, basename(fromPath), stat)
    await ensureParentDir(target)
    if (source.isDirectory()) await cp(fromPath, target, { recursive: true })
    else await copyFile(fromPath, target)
    return { from: fromPath, to: target }
  }

  /**
   * Delete a file or directory into the OS recycle bin. Windows: PowerShell
   * system recycle bin; macOS: Finder trash; Linux: `gio trash` (XDG). Every
   * non-Windows path falls back to an internal trash under `~/.dsh-file-explorer-trash/`
   * when the system mechanism is unavailable.
   * @returns { path, recycled: "system" | "internal" | false }
   */
  async fsDelete(path) {
    const filePath = toAbsolute(path)
    await assertInsideWorkspace(this.ctx, filePath)
    await assertNotWorkspaceRoot(this.ctx, filePath)
    const info = await stat(filePath).catch(() => null)
    if (info === null) throw new Error('not found: ' + filePath)
    const isDir = info.isDirectory()
    if (process.platform === 'win32') {
      await deleteToRecycleBin(filePath, isDir)
      return { path: filePath, recycled: 'system' }
    }
    if (process.platform === 'darwin') {
      try {
        await deleteToMacTrash(filePath)
        return { path: filePath, recycled: 'system' }
      } catch (err) {
        const target = await deleteToInternalTrash(filePath)
        return { path: filePath, recycled: 'internal', trashPath: target }
      }
    }
    // linux and everything else: try gio trash, fall back to internal trash.
    try {
      await deleteToXdgTrash(filePath)
      return { path: filePath, recycled: 'system' }
    } catch (err) {
      const target = await deleteToInternalTrash(filePath)
      return { path: filePath, recycled: 'internal', trashPath: target }
    }
  }

  /**
   * Move a file or directory into a destination directory (drag & drop).
   * Same-name targets are refused (no silent overwrite). Cross-device moves
   * fall back to copy + remove.
   */
  async fsMove(from, toDir) {
    const fromPath = toAbsolute(from)
    const destDir = toAbsolute(toDir)
    await assertInsideWorkspace(this.ctx, fromPath)
    await assertInsideWorkspace(this.ctx, destDir)
    await assertNotWorkspaceRoot(this.ctx, fromPath)
    const source = await stat(fromPath).catch(() => null)
    if (source === null) throw new Error('not found: ' + fromPath)
    const destInfo = await stat(destDir).catch(() => null)
    if (destInfo === null || destInfo.isDirectory() !== true) throw new Error('not a directory: ' + destDir)
    assertNoSelfNesting(fromPath, destDir, 'move')
    const target = join(destDir, basename(fromPath))
    const existing = await stat(target).catch(() => null)
    if (existing !== null) throw new Error('already exists: ' + target)
    await ensureParentDir(target)
    try {
      await rename(fromPath, target)
    } catch (err) {
      if (err && err.code === 'EXDEV') {
        await cp(fromPath, target, { recursive: source.isDirectory(), force: false })
        await rm(fromPath, { recursive: source.isDirectory(), force: false })
      } else {
        throw err
      }
    }
    return { from: fromPath, to: target }
  }

  async wsRoot() {
    const root = await resolveWorkspaceRoot(this.ctx)
    return { root: root, platform: process.platform }
  }

  async wsList() {
    const registry = this.ctx.get('workspaceRegistry')
    if (registry === undefined) return { workspaces: [] }
    const list = await registry.list()
    return {
      workspaces: list.map((w) => ({
        path: typeof w.path === 'string' ? w.path : '',
        title: typeof w.title === 'string' ? w.title : '',
        // v1.9.21: dsh-workspace 0.1.2 的 WorkspaceEntity 暴露 `id`
        //（旧的 workspaceId 字段已不存在，String(undefined) 会产出 "undefined"）
        id: String(w.id)
      }))
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
markRemote('fsList')
markRemote('fsRead')
markRemote('fsRender')
markRemote('fsWrite')
markRemote('fsCreate')
markRemote('fsRename')
markRemote('fsCopy')
markRemote('fsDelete')
markRemote('fsMove')
markRemote('wsRoot')
markRemote('wsList')

export function apply(ctx) {
  // TypertRemoteService registers `fileExplorer` in ctx.reflect.props and sets
  // `service.typertRemote`; the Gateway's source-mode discovery consumes both.
  new FileExplorerService(ctx)

  // Prune stale internal-trash entries on startup (best-effort).
  cleanupInternalTrash().catch(() => {})

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
