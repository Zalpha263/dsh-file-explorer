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
import { writeFile, mkdir, rename, copyFile, cp, stat, rm } from 'node:fs/promises'
import { dirname, join, basename } from 'node:path'
import { execFile } from 'node:child_process'

const DEFAULT_MAX_BYTES = 512 * 1024
const MAX_BYTES_CAP = 2 * 1024 * 1024
const DELETE_TIMEOUT_MS = 60 * 1000

/** Move a file or directory into the OS recycle bin (Windows PowerShell). */
function deleteToRecycleBin(filePath, isDir) {
  return new Promise((resolve, reject) => {
    const escaped = String(filePath).replace(/'/g, "''")
    const method = isDir ? 'DeleteDirectory' : 'DeleteFile'
    const script =
      `Add-Type -AssemblyName Microsoft.VisualBasic; ` +
      `[Microsoft.VisualBasic.FileIO.FileSystem]::${method}('${escaped}','OnlyErrorDialogs','SendToRecycleBin')`
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], {
      timeout: DELETE_TIMEOUT_MS,
      windowsHide: true
    }, (error, stdout, stderr) => {
      if (error) {
        const detail = String(stderr || stdout || error.message).trim()
        reject(new Error('recycle bin failed: ' + (detail || error.message)))
        return
      }
      resolve(true)
    })
  })
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
  if (candidate.startsWith('/') || /^[A-Za-z]:[\\/]/.test(candidate)) return candidate
  const base = runningCwd || recentCwd || process.cwd()
  return join(base, candidate)
}

/** Ensure the parent directory of a path exists. */
async function ensureParentDir(filePath) {
  const parent = dirname(filePath)
  if (parent && parent !== filePath) await mkdir(parent, { recursive: true })
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
    if (size !== null && size > limit) {
      const bytes = await fs.readBytes(target, undefined, limit)
      const text = new TextDecoder().decode(bytes)
      if (text.includes('\0')) return Object.assign(result, { binary: true })
      return Object.assign(result, { truncated: true, text })
    }
    const text = await fs.readText(target)
    if (text.includes('\0')) return Object.assign(result, { binary: true })
    if (text.length > limit) {
      return Object.assign(result, { truncated: true, text: text.slice(0, limit) })
    }
    return Object.assign(result, { truncated: false, text })
  }

  /**
   * Write text content to a file (creates or overwrites). When `expectedVersion`
   * is supplied, the write is refused if the file changed since it was read.
   */
  async fsWrite(path, content, expectedVersion) {
    if (typeof content !== 'string') throw new Error('content must be a string')
    const filePath = toAbsolute(path)
    if (typeof expectedVersion === 'string' && expectedVersion !== '') {
      const info = await stat(filePath).catch(() => null)
      const current = versionOf(info)
      if (current === null) throw new Error('file no longer exists: ' + filePath)
      if (current !== expectedVersion) throw new Error('file changed on disk since it was opened; reload and try again')
    }
    await ensureParentDir(filePath)
    await writeFile(filePath, content, 'utf8')
    const after = await stat(filePath).catch(() => null)
    return { path: filePath, version: versionOf(after) }
  }

  /** Create a new file or directory. Refuses when the target already exists. */
  async fsCreate(path, type, content) {
    const filePath = toAbsolute(path)
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
    const source = await stat(fromPath).catch(() => null)
    if (source === null) throw new Error('not found: ' + fromPath)
    const dest = await stat(toPath).catch(() => null)
    if (dest !== null) throw new Error('already exists: ' + toPath)
    await ensureParentDir(toPath)
    await rename(fromPath, toPath)
    return { from: fromPath, to: toPath }
  }

  /**
   * Copy a file or directory into a destination directory. Same-name targets get
   * a ` (1)` style numeric suffix. Recursive copy for directories.
   */
  async fsCopy(from, toDir) {
    const fromPath = toAbsolute(from)
    const destDir = toAbsolute(toDir)
    const source = await stat(fromPath).catch(() => null)
    if (source === null) throw new Error('not found: ' + fromPath)
    const destInfo = await stat(destDir).catch(() => null)
    if (destInfo === null || destInfo.isDirectory() !== true) throw new Error('not a directory: ' + destDir)
    const base = basename(fromPath)
    let target = join(destDir, base)
    let counter = 1
    while (true) {
      const probe = await stat(target).catch(() => null)
      if (probe === null) break
      counter += 1
      target = join(destDir, base.replace(/(\.[^.]*)?$/, ' (' + counter + ')$1'))
    }
    await ensureParentDir(target)
    if (source.isDirectory()) await cp(fromPath, target, { recursive: true })
    else await copyFile(fromPath, target)
    return { from: fromPath, to: target }
  }

  /**
   * Delete a file or directory into the OS recycle bin (Windows), or
   * permanently remove it on non-Windows platforms.
   */
  async fsDelete(path) {
    const filePath = toAbsolute(path)
    const info = await stat(filePath).catch(() => null)
    if (info === null) throw new Error('not found: ' + filePath)
    if (process.platform === 'win32') {
      await deleteToRecycleBin(filePath, info.isDirectory())
      return { path: filePath, recycled: true }
    }
    await rm(filePath, { recursive: info.isDirectory(), force: false })
    return { path: filePath, recycled: false }
  }

  async wsRoot() {
    if (runningCwd !== null) return { root: runningCwd }
    if (recentCwd !== null) return { root: recentCwd }
    const agents = this.ctx.get('agents')
    if (agents !== undefined) {
      const roots = agents.roots()
      for (let i = roots.length - 1; i >= 0; i--) {
        const agent = roots[i]
        const cwd = cwdOf(agent && agent.session)
        if (cwd) return { root: cwd }
      }
    }
    const registry = this.ctx.get('workspaceRegistry')
    if (registry !== undefined) {
      const list = await registry.list()
      if (list.length > 0 && typeof list[0].path === 'string') {
        return { root: list[0].path }
      }
    }
    const policy = this.ctx.get('sandboxPolicy')
    return { root: policy ? policy.workspaceRoot : null }
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
markRemote('wsRoot')
markRemote('wsList')

export function apply(ctx) {
  // TypertRemoteService registers `fileExplorer` in ctx.reflect.props and sets
  // `service.typertRemote`; the Gateway's source-mode discovery consumes both.
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
