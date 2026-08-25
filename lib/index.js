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
import { writeFile, mkdir, rename, copyFile, cp, stat, rm, readdir } from 'node:fs/promises'
import { dirname, join, basename } from 'node:path'
import { execFile } from 'node:child_process'
import { homedir } from 'node:os'

const DEFAULT_MAX_BYTES = 512 * 1024
const MAX_BYTES_CAP = 2 * 1024 * 1024
const DELETE_TIMEOUT_MS = 60 * 1000
const INTERNAL_TRASH_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
const INTERNAL_TRASH_MAX_ITEMS = 200

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

/** Stable version token for a file: `mtimeMs|size` — changes on any content mutation. */
function versionOf(info) {
  if (!info || typeof info.mtimeMs !== 'number' || typeof info.size !== 'number') return null
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
 */
function assertNoSelfNesting(fromPath, destDir, verb) {
  const sep = process.platform === 'win32' ? '\\' : '/'
  const norm = (p) => {
    const trimmed = p.replace(/[\\/]+$/, '')
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
 * Resolve the current workspace root (async — may consult agent sessions /
 * the workspace registry / the sandbox policy). Returns null when unknown.
 */
async function workspaceRootOf(ctx) {
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
  const root = await workspaceRootOf(ctx)
  if (root === null || root === '') {
    throw new Error('无法确定工作区根目录，已拒绝文件操作：' + filePath)
  }
  const rootNorm = normPath(root)
  const pathNorm = normPath(filePath)
  const sep = process.platform === 'win32' ? '\\' : '/'
  if (pathNorm !== rootNorm && !pathNorm.startsWith(rootNorm + sep)) {
    throw new Error('目标不在当前工作区内，已拒绝：' + filePath)
  }
}

/** `file (N).ext`-style unique target name; dotfiles keep their leading dot. */
function uniqueTargetName(destDir, base, probe) {
  const dot = base.lastIndexOf('.')
  const stem = dot > 0 ? base.slice(0, dot) : base
  const ext = dot > 0 ? base.slice(dot) : ''
  let counter = 0
  let target = join(destDir, base)
  const exists = async (p) => (await probe(p).catch(() => null)) !== null
  return (async () => {
    while (await exists(target)) {
      counter += 1
      target = join(destDir, `${stem} (${counter})${ext}`)
    }
    return target
  })()
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
      // `limit` characters and mark the preview truncated. The backend raises
      // FS_NOT_TEXT when the sample contains NUL — that is the binary signal.
      let text = ''
      let truncated = false
      if (typeof fs.streamText === 'function') {
        const stream = await fs.streamText(target)
        for await (const chunk of stream) {
          if (text.length >= limit) {
            truncated = true
            break
          }
          text += chunk
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
   * Write text content to a file (creates or overwrites). When `expectedVersion`
   * is supplied, the write is refused if the file changed since it was read.
   */
  async fsWrite(path, content, expectedVersion) {
    if (typeof content !== 'string') throw new Error('content must be a string')
    const filePath = toAbsolute(path)
    await assertInsideWorkspace(this.ctx, filePath)
    if (typeof expectedVersion === 'string' && expectedVersion !== '') {
      const info = await stat(filePath).catch(() => null)
      const current = versionOf(info)
      if (current === null) throw new Error('file no longer exists: ' + filePath)
      if (current !== expectedVersion) throw new Error('file changed on disk since it was opened; reload and try again')
    }
    await ensureParentDir(filePath)
    await writeFile(filePath, content, 'utf8')
    const after = await stat(filePath).catch(() => null)
    return { path: filePath, version: versionOf(after), size: after ? after.size : null }
  }

  /** Create a new file or directory. Refuses when the target already exists. */
  async fsCreate(path, type, content) {
    const filePath = toAbsolute(path)
    await assertInsideWorkspace(this.ctx, filePath)
    const existing = await stat(filePath).catch(() => null)
    if (existing !== null) throw new Error('already exists: ' + filePath)
    if (type === 'dir') {
      await ensureParentDir(filePath)
      await mkdir(filePath)
      return { path: filePath, type: 'dir' }
    }
    if (type !== 'file') throw new Error('type must be "file" or "dir"')
    await ensureParentDir(filePath)
    await writeFile(filePath, typeof content === 'string' ? content : '', 'utf8')
    return { path: filePath, type: 'file' }
  }

  /** Rename or move a file/directory. Refuses when the destination exists. */
  async fsRename(from, to) {
    const fromPath = toAbsolute(from)
    const toPath = toAbsolute(to)
    await assertInsideWorkspace(this.ctx, fromPath)
    await assertInsideWorkspace(this.ctx, toPath)
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
    const root = await this.resolveWorkspaceRoot()
    return { root: root, platform: process.platform }
  }

  async resolveWorkspaceRoot() {
    if (runningCwd !== null) return runningCwd
    if (recentCwd !== null) return recentCwd
    const agents = this.ctx.get('agents')
    if (agents !== undefined) {
      const roots = agents.roots()
      for (let i = roots.length - 1; i >= 0; i--) {
        const agent = roots[i]
        const cwd = cwdOf(agent && agent.session)
        if (cwd) return cwd
      }
    }
    const registry = this.ctx.get('workspaceRegistry')
    if (registry !== undefined) {
      const list = await registry.list()
      if (list.length > 0 && typeof list[0].path === 'string') {
        return list[0].path
      }
    }
    const policy = this.ctx.get('sandboxPolicy')
    return policy ? policy.workspaceRoot : null
  }

  async wsList() {
    const registry = this.ctx.get('workspaceRegistry')
    if (registry === undefined) return { workspaces: [] }
    const list = await registry.list()
    return {
      workspaces: list.map((w) => ({
        path: typeof w.path === 'string' ? w.path : '',
        title: typeof w.title === 'string' ? w.title : '',
        id: String(w.workspaceId)
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
