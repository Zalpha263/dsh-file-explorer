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

const DEFAULT_MAX_BYTES = 512 * 1024
const MAX_BYTES_CAP = 2 * 1024 * 1024

// Most-recent workspace signals, shared by the service methods (one host instance).
let runningCwd = null
let recentCwd = null

function cwdOf(session) {
  if (session && session.header && typeof session.header.cwd === 'string' && session.header.cwd !== '') {
    return session.header.cwd
  }
  return null
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
    const result = { path: fs.processPath(target), size }
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
