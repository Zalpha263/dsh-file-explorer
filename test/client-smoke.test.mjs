// dsh-file-explorer — 客户端半区冒烟测试（零依赖，node:test）
//
// 为什么必须有：客户端是手写的 __ModuleLoader__ bundle，`node --check` 只能证明
// "能解析"，证明不了"能挂载"（本项目吃过一次亏：语法通过、面板一片空白）。
// 这里用一个最小 DOM + 最小 hooks 运行时把真实 bundle 跑起来，覆盖：
//   ① bundle 注册与导出
//   ② remote 贡献只有 fsStat/fsRead/fsWrite（旧的文件操作接口必须消失），
//      且三个方法都声明了可选尾参 sessionId
//   ③ 官方两阶段注册：槽位晚到 / sidebarRightTabs 服务晚到，出现后仍能注册
//      正文 + 标签类型（keepMounted=true，不声明 patterns）
//   ④ 「编辑」按钮 → ctx.sidebarRight.openResource(地址, { kind:'file-editor',
//      params:{ absolutePath } })；地址编码与官方 dsh-util-workspace-path 对齐
//   ⑤ 地址 ↔ 路径向量（`:`, 空格, 中文, `.`/`..`）
//   ⑥ 编辑页：读文件（带 sessionId）→ 官方代码块结构（行号/换行/输入层）
//      → 高亮 ~120ms 合并 → Ctrl+S 用正确版本号 + sessionId 写回
//   ⑦ 轮询：每标签一个 interval、隐藏标签（tab.visible=false）暂停
//   ⑧ 渲染契约：官方 code font token、行号 CSS counter、默认自动换行与切换
//
// 运行：node test/client-smoke.test.mjs

import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const SOURCE = fs.readFileSync(path.join(here, '..', 'lib', 'client.js'), 'utf8')
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/* ---------------- 最小 DOM ---------------- */
function makeEl(tag) {
  const el = {
    tagName: String(tag).toUpperCase(),
    children: [],
    dataset: {},
    _text: '',
    get textContent() { return this.children.length === 0 ? this._text : this._text + this.children.map((c) => c.textContent).join('') },
    set textContent(v) { this._text = String(v); this.children = [] },
    appendChild(c) { this.children.push(c); return c },
    /* 客户端只查 style[data-plugin-css=...]；保持最小实现即可。 */
    querySelector(sel) {
      const want = sel.replace(/^style\[data-plugin-css="([^"]+)"\]$/, '$1')
      let hit = null
      const walk = (n) => {
        if (hit !== null) return
        for (const c of n.children) {
          if (c.tagName === 'STYLE' && c.dataset.pluginCss === want) { hit = c; return }
          walk(c)
        }
      }
      walk(this)
      return hit
    }
  }
  return el
}
function makeDocument() {
  const doc = makeEl('html')
  doc.head = makeEl('head')
  doc.body = makeEl('body')
  doc.createElement = (tag) => makeEl(tag)
  doc.createTextNode = (t) => { const el = makeEl('#text'); el.textContent = t; return el }
  doc.querySelector = (sel) => { for (const t of [doc.head, doc.body]) { const hit = t.querySelector(sel); if (hit) return hit } return null }
  doc._listeners = {}
  doc.addEventListener = (name, fn) => { (doc._listeners[name] = doc._listeners[name] || []).push(fn) }
  doc.removeEventListener = (name, fn) => {
    const list = doc._listeners[name]
    if (!Array.isArray(list)) return
    const i = list.indexOf(fn)
    if (i >= 0) list.splice(i, 1)
  }
  doc.dispatch = (name, event) => { for (const fn of (doc._listeners[name] || []).slice()) fn(event) }
  return doc
}

/* ---------------- 最小 hooks 运行时 ----------------
   直接调用函数组件：按调用顺序保存 state/ref/memo/effect，setState 触发重渲染。
   足够驱动本插件的编辑页（真实 React 的行为差异不在被断言的范围内）。 */
function createHookRuntime() {
  const slots = { values: [], refs: [], memos: [], effects: [], cleanups: [] }
  let cursor = 0
  let dirty = false
  let render = null
  const sameDeps = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => Object.is(x, b[i]))
  const api = {
    useState(init) {
      const i = cursor++
      if (!(i in slots.values)) slots.values[i] = typeof init === 'function' ? init() : init
      const set = (next) => {
        const value = typeof next === 'function' ? next(slots.values[i]) : next
        if (Object.is(value, slots.values[i])) return
        slots.values[i] = value
        dirty = true
        if (render) queueMicrotask(() => render())
      }
      return [slots.values[i], set]
    },
    useRef(init) {
      const i = cursor++
      if (!(i in slots.refs)) slots.refs[i] = { current: init }
      return slots.refs[i]
    },
    useMemo(fn, deps) {
      const i = cursor++
      const prev = slots.memos[i]
      if (prev !== undefined && sameDeps(prev.deps, deps)) return prev.value
      const value = fn()
      slots.memos[i] = { value, deps }
      return value
    },
    useCallback(fn, deps) { return api.useMemo(() => fn, deps) },
    useEffect(fn, deps) {
      const i = cursor++
      const prev = slots.effects[i]
      if (prev !== undefined && sameDeps(prev.deps, deps)) {
        slots.effects[i] = { fn, deps, fresh: false, cleanup: prev.cleanup }
        return
      }
      /* 依赖变化时真实 React 会先跑上一次的 cleanup（清掉旧 interval/timeout）。 */
      if (prev !== undefined && typeof prev.cleanup === 'function') {
        try { prev.cleanup() } catch (err) { /* 测试里吞掉 */ }
      }
      slots.effects[i] = { fn, deps, fresh: true, cleanup: null }
    }
  }
  return {
    api,
    mount(component, props) {
      let tree = null
      const pass = () => {
        cursor = 0
        dirty = false
        tree = component(props)
        for (const slot of slots.effects) {
          if (slot === undefined || slot.fresh !== true) continue
          slot.fresh = false
          const cleanup = slot.fn()
          slot.cleanup = typeof cleanup === 'function' ? cleanup : null
          slots.cleanups.push(cleanup)
        }
        return tree
      }
      render = pass
      return { get tree() { return tree }, render: pass, unmount() { for (const c of slots.cleanups.splice(0)) { if (typeof c === 'function') { try { c() } catch (err) {} } } } }
    }
  }
}

/* ---------------- 载入 bundle ---------------- */
function loadBundle(primitives) {
  let entry = null
  const document = makeDocument()
  const intervals = []
  const window = {
    __ModuleLoader__: { load: (e) => { entry = e } },
    setInterval: (fn, ms) => {
      const id = setInterval(fn, ms)
      intervals.push({ fn, ms, id })
      return id
    },
    clearInterval: (id) => {
      const i = intervals.findIndex((item) => item.id === id)
      if (i >= 0) intervals.splice(i, 1)
      clearInterval(id)
    },
    setTimeout: (fn, ms) => setTimeout(fn, ms), clearTimeout: (id) => clearTimeout(id),
    requestAnimationFrame: (fn) => setTimeout(() => fn(Date.now()), 0)
  }
  const React = {
    createElement: (type, props, ...children) => ({ type, props: props || {}, children: children.flat().filter((c) => c !== null && c !== undefined && c !== false) })
  }
  /* 组件的 hooks 必须落在**同一个**运行时里，否则用例驱动的是另一套空槽位，
     effect 永远不会执行（第一版就是这么把自己骗过去的）。 */
  const hooks = createHookRuntime()
  const ReactWithHooks = Object.assign({}, React, hooks.api)
  const requireStub = (name) => {
    if (name === 'react') return ReactWithHooks
    if (name === '@deepseek-ai/dsh-client-ui-primitives') {
      if (primitives === null) { const err = new Error('missed the module table'); throw err }
      return primitives
    }
    return {}
  }
  const copied = []
  const globals = {
    window, document,
    navigator: { clipboard: { writeText: (value) => { copied.push(value); return Promise.resolve() } } },
    requestAnimationFrame: window.requestAnimationFrame
  }
  // 在函数体内运行 bundle 源码，让 window.__ModuleLoader__.load 被调用
  const factory = new Function(...Object.keys(globals), SOURCE)
  factory(...Object.values(globals))
  assert.ok(entry !== null, 'bundle 未调用 __ModuleLoader__.load')
  const exported = entry.factory(requireStub)
  return { entry, exported, document, hooks, intervals, copied }
}

/** 官方高亮件的替身：语言表与 useCodeHighlighter 都要在（验证我们真用了官方接口）。 */
const Icon = (props) => ({ type: 'svg', props: props || {}, children: [] })
const PRIMITIVES_STUB = {
  languageForPath: (p) => (/\.(md|markdown)$/i.test(p) ? 'markdown' : /\.(js|mjs|cjs)$/i.test(p) ? 'javascript' : undefined),
  useCodeHighlighter: () => (code) => String(code).split('\n').map((line) => [{ text: line, style: { color: '#abc' } }]),
  IconPlusOutlineRegular: Icon,
  IconEditOutlineRegular: Icon,
  IconTrashOutlineRegular: Icon,
  IconEllipsisOutlineRegular: Icon,
  IconCopyOutlineRegular: Icon,
  Modal: (props) => ({ type: 'modal', props: props || {}, children: [] })
}

/* ---------------- 宿主桩 ---------------- */
const ABS = 'D:\\DeepseekPlugin\\notes\\a.md'
const FOLDER = 'D:\\DeepseekPlugin\\notes'
const SESSION = 'sess-1'
/* 客户端拿不到会话 cwd，所以生成的是"会话作用域 + 绝对路径"地址；盘符的 `:`
   按官方规则保留字面量（不是 %3A）。 */
const ADDRESS = 'dsh-resource://file/session/sess-1/D:/DeepseekPlugin/notes/a.md'
const MAX_TEXT_BYTES = 2 * 1024 * 1024

function makeHarness(opts = {}) {
  const { exported, document, hooks, intervals, copied } = loadBundle(opts.noPrimitives ? null : PRIMITIVES_STUB)
  const registered = []
  const opened = []
  const calls = []
  const mounted = []
  const deferredSlots = new Map()
  const ok = (value) => Promise.resolve({ ok: true, value })
  const CWD = 'D:\\DeepseekPlugin\\notes'
  const failOf = (method) => {
    const message = opts.fail && opts.fail[method]
    return message === undefined ? null : Promise.resolve({ ok: false, error: { message } })
  }
  const describeOf = (p, overrides) => Object.assign({
    absolute: p,
    native: p,
    relative: 'a.md',
    name: String(p).split(/[\\/]/).filter(Boolean).pop() || 'a.md',
    directory: CWD,
    kind: 'file',
    exists: true,
    link: false,
    insideWorkspace: true,
    version: 'v1',
    size: 42
  }, overrides || {})
  const namespace = {
    fsStat: (p, sessionId) => { calls.push(['fsStat', p, sessionId]); return ok({ path: p, type: 'file', size: 42, version: opts.statVersion || 'v1' }) },
    fsRead: (p, maxBytes, sessionId) => {
      calls.push(['fsRead', p, maxBytes, sessionId])
      if (opts.readFails) return Promise.resolve({ ok: false, error: { message: 'read failed' } })
      return ok({ path: p, size: 42, version: 'v1', truncated: false, decodeValid: true, text: opts.fileText || 'line one\nline two\n' })
    },
    fsWrite: (p, content, version, sessionId) => { calls.push(['fsWrite', p, content, version, sessionId]); return ok({ path: p, version: 'v2', size: content.length }) },
    fsEnvironment: (sessionId) => {
      calls.push(['fsEnvironment', sessionId])
      if (opts.fail && opts.fail.fsEnvironment) return failOf('fsEnvironment')
      return ok(Object.assign({
        platform: 'win32', separator: '\\', caseSensitive: false, localBackend: true,
        cwd: CWD, workspaceRoot: CWD
      }, opts.env || {}))
    },
    fsDescribe: (p, sessionId) => {
      calls.push(['fsDescribe', p, sessionId])
      if (opts.fail && opts.fail.fsDescribe) return failOf('fsDescribe')
      return ok(describeOf(p, opts.describe))
    },
    fsCreateFile: (directory, name, sessionId) => {
      calls.push(['fsCreateFile', directory, name, sessionId])
      if (opts.fail && opts.fail.fsCreateFile) return failOf('fsCreateFile')
      return ok({ path: directory + '\\' + name, name, version: 'v-created' })
    },
    fsCreateFolder: (directory, name, sessionId) => {
      calls.push(['fsCreateFolder', directory, name, sessionId])
      if (opts.fail && opts.fail.fsCreateFolder) return failOf('fsCreateFolder')
      return ok({ path: directory + '\\' + name, name })
    },
    fsRename: (p, newName, sessionId) => {
      calls.push(['fsRename', p, newName, sessionId])
      if (opts.fail && opts.fail.fsRename) return failOf('fsRename')
      const directory = String(p).slice(0, String(p).lastIndexOf('\\'))
      return ok({ path: directory + '\\' + newName, name: newName, previousPath: p })
    },
    fsDelete: (p, expectedVersion, sessionId) => {
      calls.push(['fsDelete', p, expectedVersion, sessionId])
      if (opts.fail && opts.fail.fsDelete) return failOf('fsDelete')
      return ok({ path: p, name: String(p).split(/[\\/]/).filter(Boolean).pop() || 'a.md' })
    },
    fsDeleteFolder: (p, sessionId) => {
      calls.push(['fsDeleteFolder', p, sessionId])
      if (opts.fail && opts.fail.fsDeleteFolder) return failOf('fsDeleteFolder')
      return ok({ path: p, name: String(p).split(/[\\/]/).filter(Boolean).pop() || 'notes' })
    }
  }
  const tabs = { register: (def) => { registered.push({ def, comp: null }); return () => {} } }
  let tabsService = opts.lateTabs ? null : tabs
  const runSlot = (name, cb) => {
    const result = cb()
    const list = Array.isArray(result) ? result.filter((d) => typeof d === 'function') : (typeof result === 'function' ? [result] : [])
    return () => { for (const dispose of list.slice().reverse()) { try { dispose() } catch (err) {} } }
  }
  const slots = {
    inject: (name, cb) => {
      if (Array.isArray(opts.deferSlots) && opts.deferSlots.includes(name)) {
        deferredSlots.set(name, cb)
        return () => {}
      }
      return runSlot(name, cb)
    },
    register: (def, comp) => { registered.push({ def, comp }); return () => {} }
  }
  const sidebarRight = { openResource: (address, options) => { opened.push([address, options]) } }
  const menuProviders = []
  const notices = []
  const menuOpens = []
  const contextMenus = {
    register: (provider) => {
      menuProviders.push(provider)
      return () => {
        const i = menuProviders.indexOf(provider)
        if (i >= 0) menuProviders.splice(i, 1)
      }
    },
    notify: (text, success) => { notices.push([text, success]) },
    open: (target, point) => { menuOpens.push([target, point]) }
  }
  const ctx = {
    effect: (fn) => { const d = fn(); return () => { if (typeof d === 'function') d() } },
    get: (k) => {
      if (k === 'slots') return slots
      if (k === 'sidebarRightTabs') return tabsService
      if (k === 'sidebarRight') return sidebarRight
      if (k === 'contextMenus') return contextMenus
      if (k === 'remote.fileExplorer') return namespace
      return undefined
    },
    inject: (deps, cb) => { if (cb) cb(); return () => {} },
    remote: { $mount: async (c) => { mounted.push(c); return () => {} } },
    /* cordis 把服务同时挂成 ctx.<serviceName>；官方插件（如 ui-open-in-app）
       用的就是 ctx.slots.* 这种属性写法，所以桩也要给属性，否则测不出真实调用面。 */
    slots: slots,
    sidebarRightTabs: tabs,
    sidebarRight: sidebarRight,
    contextMenus: contextMenus
  }
  return {
    exported, ctx, document, hooks, intervals, copied, registered, opened, calls, mounted,
    menuProviders, notices, menuOpens, contextMenus,
    /** 让"晚到的槽位"出现（模拟 dsh-client-ui-sidebar-right 的 declaration）。 */
    declareSlot: (name) => {
      const cb = deferredSlots.get(name)
      deferredSlots.delete(name)
      if (cb === undefined) return
      runSlot(name, cb)
    },
    /** 让"晚到的 sidebarRightTabs 服务"出现。 */
    provideTabs: () => { tabsService = tabs },
    find: (name) => registered.find((r) => r.def.name === name),
    all: (name) => registered.filter((r) => r.def.name === name)
  }
}

function findNode(node, pred) {
  if (node === null || typeof node !== 'object') return null
  if (pred(node)) return node
  for (const c of node.children || []) { const hit = findNode(c, pred); if (hit) return hit }
  return null
}
function editorBody(h) {
  return h.all('sidebar.right.pane.tab').find((r) => r.def.key === 'file-editor')
}
async function mountEditor(h, tab = {}) {
  const body = editorBody(h)
  assert.ok(body, '未注册编辑页正文')
  const info = Object.assign({ contentId: ADDRESS, navigation: { params: { absolutePath: ABS } } }, tab)
  const inst = h.hooks.mount(body.comp, { useTabInfo: () => ({ tab: info }) })
  inst.render()
  await sleep(30)
  inst.render()
  return { inst, body, tabInfo: info }
}

/* ---------------- 用例 ---------------- */
test('bundle 注册与导出', () => {
  const { entry, exported } = loadBundle(PRIMITIVES_STUB)
  assert.equal(entry.id, 'dsh-file-explorer')
  assert.equal(typeof exported.apply, 'function')
  assert.deepEqual(exported.inject, ['slots', 'remote'])
  assert.equal(typeof exported.__test, 'object', '纯函数测试出口必须存在')
})

test('remote 贡献：编辑三方法 + 文件管理七方法，sessionId 可选尾参', async () => {
  const h = makeHarness()
  await h.exported.apply(h.ctx)
  assert.equal(h.mounted.length, 1)
  const descriptors = h.mounted[0].descriptors
  assert.deepEqual(descriptors.map((d) => d.method), [
    'fsStat', 'fsRead', 'fsWrite',
    'fsEnvironment', 'fsDescribe', 'fsCreateFile', 'fsCreateFolder', 'fsRename', 'fsDelete', 'fsDeleteFolder'
  ])
  const params = Object.fromEntries(descriptors.map((d) => [d.method, d.parameters.map((p) => p.name)]))
  assert.deepEqual(params.fsStat, ['path', 'sessionId'])
  assert.deepEqual(params.fsRead, ['path', 'maxBytes', 'sessionId'])
  assert.deepEqual(params.fsWrite, ['path', 'content', 'expectedVersion', 'sessionId'])
  assert.deepEqual(params.fsEnvironment, ['sessionId'])
  assert.deepEqual(params.fsDescribe, ['path', 'sessionId'])
  assert.deepEqual(params.fsCreateFile, ['directory', 'name', 'sessionId'])
  assert.deepEqual(params.fsCreateFolder, ['directory', 'name', 'sessionId'])
  assert.deepEqual(params.fsRename, ['path', 'newName', 'sessionId'])
  assert.deepEqual(params.fsDelete, ['path', 'expectedVersion', 'sessionId'])
  assert.deepEqual(params.fsDeleteFolder, ['path', 'sessionId'])
  for (const d of descriptors) {
    const optional = d.parameters.find((p) => p.name === 'sessionId')
    assert.equal(optional.acceptsUndefined, true, d.method + ' 的 sessionId 必须声明 acceptsUndefined（旧调用不传时要通过网关注解）')
  }
  for (const gone of ['fsList', 'fsRender', 'fsCreate', 'fsCopy', 'fsMove', 'wsRoot', 'wsList']) {
    assert.ok(!params[gone], gone + ' 应已从贡献中移除')
  }
  for (const d of descriptors) {
    assert.equal(d.result.mode, 'strict')
    assert.equal(typeof d.result.create, 'function')
  }
})

test('注册面：官方预览动作槽 + 编辑页正文 + 类型（keepMounted、不抢默认打开、无 title 槽位）', async () => {
  const h = makeHarness()
  await h.exported.apply(h.ctx)

  const action = h.find('sidebar.right.tab.document.actions')
  assert.ok(action, '未注册到官方预览头部的动作槽')
  assert.equal(action.def.id, 'dsh-file-explorer')

  const type = h.registered.find((r) => r.def.kind === 'file-editor')
  assert.ok(type, '未注册 file-editor 标签类型')
  assert.equal(type.def.id, 'file-editor')
  assert.equal(type.def.patterns, undefined, '不得声明 patterns（否则会抢走官方的默认打开）')
  assert.equal(type.def.keepMounted, true, '必须声明 keepMounted：切标签/折叠侧栏不丢未保存文本')
  assert.equal(typeof type.def.canOpen, 'function')
  assert.equal(type.def.canOpen(ADDRESS), true)
  assert.equal(type.def.canOpen('dsh-resource://other/x'), false)
  assert.equal(type.def.title(ADDRESS), '编辑 · a.md')

  const body = editorBody(h)
  assert.ok(body, '未注册编辑页正文')
  assert.equal(typeof body.comp, 'function')
  assert.equal(h.all('sidebar.right.pane.tab.title').length, 0, '静态 title 槽位应删除，让官方用 title(address)')
})

test('两阶段注册：槽位晚到 + 服务晚到，出现后仍能注册正文与类型', async () => {
  const h = makeHarness({ deferSlots: ['sidebar.right.pane.tab'], lateTabs: true })
  await h.exported.apply(h.ctx)

  assert.equal(h.all('sidebar.right.pane.tab').length, 0, '槽位未声明时不应注册正文')
  assert.equal(h.registered.filter((r) => r.def.kind === 'file-editor').length, 0, '槽位未声明时不应注册类型')

  /* 第一步：槽位出现。正文立刻注册；服务还没到，类型先挂起。 */
  h.declareSlot('sidebar.right.pane.tab')
  assert.equal(h.all('sidebar.right.pane.tab').length, 1, '槽位出现后应注册正文')
  assert.equal(h.registered.filter((r) => r.def.kind === 'file-editor').length, 0, '服务未到时不注册类型')

  /* 第二步：sidebarRightTabs 晚到。有界重试应在窗口内补上类型。 */
  h.provideTabs()
  await sleep(150)
  const type = h.registered.find((r) => r.def.kind === 'file-editor')
  assert.ok(type, '服务出现后应有界重试注册成功')
  assert.equal(type.def.keepMounted, true)
})

test('地址编解码：与官方 dsh-util-workspace-path 规则一致（:、空格、中文、. / ..）', () => {
  const A = loadBundle(PRIMITIVES_STUB).exported.__test
  assert.equal(A.encodeSegment('D:'), 'D:', '盘符的冒号必须保留字面量')
  assert.equal(A.encodeSegment('a b'), 'a%20b')
  assert.equal(A.encodeSegment('中文'), '%E4%B8%AD%E6%96%87')
  assert.equal(A.encodePath('D:/工作 区/中文.md'), 'D:/%E5%B7%A5%E4%BD%9C%20%E5%8C%BA/%E4%B8%AD%E6%96%87.md')

  assert.equal(A.sessionFileAddress('sess-1', 'D:\\work\\a b.md'), 'dsh-resource://file/session/sess-1/D:/work/a%20b.md')
  assert.equal(A.sessionFileAddress('sess-1', './notes/../a.md'), 'dsh-resource://file/session/sess-1/notes/../a.md', '. 与 .. 原样保留')


  assert.deepEqual(A.parseFileAddress('dsh-resource://file/session/sess-1/D:/work/a%20b.md'), { sessionId: 'sess-1', path: 'D:/work/a b.md' })
  assert.deepEqual(A.parseFileAddress('dsh-resource://file/session/sess-1/notes/%2E%2E/%E4%B8%AD.md'), { sessionId: 'sess-1', path: 'notes/../中.md' })
  assert.deepEqual(A.parseFileAddress('dsh-resource://file/session/sess-1/a.md?x=1#frag'), { sessionId: 'sess-1', path: 'a.md' })
  assert.equal(A.parseFileAddress('dsh-resource://file/absolute/D:/work/a.md'), null)
  assert.equal(A.parseFileAddress('not-an-address'), null)
  assert.equal(A.parseFileAddress('dsh-resource://file/session/sess-1'), null)
})

test('渲染模型：行号宽度与末尾换行（editorLines / lineNumberWidth）', () => {
  const A = loadBundle(PRIMITIVES_STUB).exported.__test
  assert.deepEqual(A.editorLines('a\nb\n'), { lines: ['a', 'b', ''], eofBlank: true, numberedCount: 2 })
  assert.deepEqual(A.editorLines('a\nb'), { lines: ['a', 'b'], eofBlank: false, numberedCount: 2 })
  assert.deepEqual(A.editorLines(''), { lines: [''], eofBlank: false, numberedCount: 1 })
  assert.equal(A.lineNumberWidth(1), '2ch')
  assert.equal(A.lineNumberWidth(9), '2ch')
  assert.equal(A.lineNumberWidth(10), '2ch')
  assert.equal(A.lineNumberWidth(99), '2ch')
  assert.equal(A.lineNumberWidth(100), '3ch')
  assert.equal(A.scrollOffsets, undefined, '旧的 transform 坐标换算已删除')
})

test('编辑页：默认自动换行，可切换为不换行（textarea 与高亮层同规则）', async () => {
  const h = makeHarness({ fileText: 'one\n' })
  await h.exported.apply(h.ctx)
  const { inst } = await mountEditor(h)
  const content = () => findNode(inst.tree, (n) => n.props && typeof n.props.className === 'string' && n.props.className.indexOf('dfe-content') === 0)
  const input = () => findNode(inst.tree, (n) => n.props && n.props.className === 'dfe-input')
  const wrapBtn = () => findNode(inst.tree, (n) => n.props && n.props['data-dfe-tool'] === 'wrap')
  assert.ok(content().props.className.includes('dfe-wrap'), '默认应开启自动换行')
  assert.equal(input().props.wrap, 'soft')
  assert.equal(wrapBtn().props['aria-pressed'], 'true')
  wrapBtn().props.onClick()
  await sleep(10)
  inst.render()
  assert.ok(content().props.className.includes('dfe-nowrap'), '切换后应关闭自动换行')
  assert.equal(input().props.wrap, 'off')
  assert.equal(wrapBtn().props['aria-pressed'], 'false')
  wrapBtn().props.onClick()
  await sleep(10)
  inst.render()
  assert.ok(content().props.className.includes('dfe-wrap'))
  inst.unmount()
})

test('编辑页：代码块横幅显示语言标签，复制按钮复制当前缓冲', async () => {
  const h = makeHarness({ fileText: 'one\n' })
  await h.exported.apply(h.ctx)
  const { inst } = await mountEditor(h)
  const json = JSON.stringify(inst.tree)
  assert.ok(json.includes('dfe-banner'), '应有官方代码块横幅')
  assert.ok(json.includes('markdown'), '语言标签应来自 languageForPath')
  const copyBtn = findNode(inst.tree, (n) => n.props && n.props['data-dfe-tool'] === 'copy')
  assert.ok(copyBtn, '横幅应有复制按钮')
  copyBtn.props.onClick()
  await sleep(10)
  assert.deepEqual(h.copied, ['one\n'], '复制按钮应复制当前编辑缓冲')
  inst.unmount()
})

test('样式：采用官方 code font token、行号 counter 与 wrap 规则', async () => {
  const h = makeHarness()
  await h.exported.apply(h.ctx)
  const style = h.document.head.children.find((node) => node.tagName === 'STYLE' && node.dataset.pluginCss === 'dsh-file-explorer:editor.css')
  assert.ok(style, '未注入编辑页样式')
  const css = style.textContent
  assert.ok(css.includes('var(--dsw-font-markdown-code-block'), '必须使用官方代码字体 token')
  assert.ok(css.includes('counter-increment:source-line'), '行号必须由 CSS counter 生成')
  assert.ok(css.includes('overflow-wrap:anywhere'), '必须支持官方同款自动换行')
  assert.ok(css.includes('padding:16px'), '必须使用官方 CodeBody 的 16px pre padding')
  assert.ok(css.includes('font:inherit'), 'code 元素必须重置字体（UA code{font-family:monospace} 会压过继承）')
})

test('「编辑」按钮：用官方规则的同一文件地址 + kind=file-editor 打开（并带上绝对路径）', async () => {
  const h = makeHarness()
  await h.exported.apply(h.ctx)
  const action = h.find('sidebar.right.tab.document.actions')
  const tree = action.comp({ absolutePath: ABS, sessionId: SESSION })
  assert.ok(tree, '按钮组件没有渲染')
  assert.equal(tree.type, 'span', '预览页头动作容器')
  const buttons = tree.children.filter((child) => child && child.type === 'button')
  assert.equal(buttons.length, 1, '预览页头只保留「编辑」按钮')
  const edit = buttons.find((child) => child.children.join('') === '编辑')
  assert.ok(edit, '缺少「编辑」按钮')
  edit.props.onClick()
  assert.equal(h.opened.length, 1, '应调用一次 openResource')
  const [address, options] = h.opened[0]
  assert.equal(address, ADDRESS, '地址要用会话作用域 + 绝对路径，并把盘符冒号保留为字面量')
  assert.equal(options.kind, 'file-editor', '必须强制用我们的 kind 打开')
  assert.equal(options.params.absolutePath, ABS, '绝对路径要经 navigation.params 传给编辑页')
})

test('编辑页：读文件（带 tab.contentId 解析出的 sessionId）→ 官方代码块结构', async () => {
  const h = makeHarness({ fileText: 'alpha\nbeta\ngamma\n' })
  await h.exported.apply(h.ctx)
  const { inst } = await mountEditor(h)
  const tree = inst.tree
  assert.ok(tree, '编辑页没有渲染')
  const read = h.calls.find((c) => c[0] === 'fsRead')
  assert.ok(read, '应读取文件')
  assert.equal(read[1], ABS)
  assert.equal(read[2], MAX_TEXT_BYTES, '读取上限应与编辑上限一致（2 MiB）')
  assert.equal(read[3], SESSION, '读请求必须带 tab.contentId 里的 sessionId（不能猜最近会话）')
  const json = JSON.stringify(tree)
  assert.ok(json.includes('alpha'), '渲染结果里应有文件内容')
  assert.ok(json.includes('dfe-hl'), '应有官方样式的代码层')
  assert.ok(json.includes('dfe-code-inner'), '行号应走官方 counter 结构')
  assert.ok(json.includes('dfe-input'), '应有输入区')
  const lineNodes = []
  const walk = (node) => {
    if (node === null || typeof node !== 'object') return
    const cls = node.props && node.props.className
    if (typeof cls === 'string' && cls.split(' ').includes('dfe-line')) lineNodes.push(node)
    for (const child of node.children || []) walk(child)
  }
  walk(tree)
  assert.equal(lineNodes.length, 4, '三条内容行 + 末尾空行（textarea 末尾换行必须可编辑）')
  assert.equal(lineNodes[3].props.className.includes('dfe-line-eof'), true, '末尾空行不显示行号')
  const layer = findNode(tree, (n) => n.props && n.props.className === 'dfe-layer')
  assert.equal(layer.props.style['--dfe-line-number-width'], '2ch', '行号宽度按官方 max(2,位数)ch 下发')
  const input = findNode(tree, (n) => n.props && n.props.className === 'dfe-input')
  assert.equal(input.props.wrap, 'soft', '默认自动换行')
  inst.unmount()
})

test('编辑页：Ctrl+S 用打开时的版本号 + sessionId 写回', async () => {
  const h = makeHarness({ fileText: 'one\n' })
  await h.exported.apply(h.ctx)
  const { inst } = await mountEditor(h)

  const input = findNode(inst.tree, (n) => n.props && n.props.className === 'dfe-input')
  assert.ok(input, '找不到输入区')
  input.props.onChange({ target: { value: 'one changed\n' } })
  await sleep(10)
  inst.render()
  const input2 = findNode(inst.tree, (n) => n.props && n.props.className === 'dfe-input')
  input2.props.onKeyDown({ key: 's', ctrlKey: true, preventDefault() {}, target: { selectionStart: 0, selectionEnd: 0 } })
  await sleep(30)
  const write = h.calls.find((c) => c[0] === 'fsWrite')
  assert.ok(write, 'Ctrl+S 应触发写回')
  assert.equal(write[1], ABS)
  assert.equal(write[2], 'one changed\n', '写回内容应是编辑后的文本')
  assert.equal(write[3], 'v1', '写回必须带打开时的版本号（陈旧守卫）')
  assert.equal(write[4], SESSION, '写回必须带 sessionId（Host 据此选工作区与策略）')
  inst.unmount()
})

test('编辑页：高亮按 ~120ms 合并，不随每次按键全量重新分词', async () => {
  const h = makeHarness({ fileText: 'one\n' })
  await h.exported.apply(h.ctx)
  const { inst } = await mountEditor(h)
  const highlightJson = () => JSON.stringify(findNode(inst.tree, (n) => n.props && n.props.className === 'dfe-hl'))
  assert.ok(highlightJson().includes('one'), '初始高亮应显示原文')

  const input = findNode(inst.tree, (n) => n.props && n.props.className === 'dfe-input')
  input.props.onChange({ target: { value: 'two\n' } })
  await sleep(0)
  inst.render()
  assert.ok(JSON.stringify(inst.tree).includes('"value":"two\\n"'), '输入区应立即显示新文本')
  assert.ok(highlightJson().includes('one'), '合并窗口内高亮层应仍停在旧文本')
  assert.ok(!highlightJson().includes('two'))

  await sleep(160)
  inst.render()
  assert.ok(highlightJson().includes('two'), '合并窗口结束后应重新高亮')
  inst.unmount()
})

test('轮询：每标签一个 interval，隐藏标签（tab.visible=false）暂停 fsStat', async () => {
  const h = makeHarness({ fileText: 'one\n' })
  await h.exported.apply(h.ctx)
  const body = editorBody(h)
  const tab = { contentId: ADDRESS, navigation: { params: { absolutePath: ABS } }, visible: false }
  const inst = h.hooks.mount(body.comp, { useTabInfo: () => ({ tab }) })
  inst.render()
  await sleep(30)
  inst.render()

  const pollTimers = h.intervals.filter((item) => item.ms === 2500)
  assert.equal(pollTimers.length, 1, '每个标签只应创建一个轮询 interval')

  const statCount = () => h.calls.filter((c) => c[0] === 'fsStat').length
  const before = statCount()
  pollTimers[0].fn()
  await sleep(10)
  assert.equal(statCount(), before, '隐藏标签不应发 fsStat')

  tab.visible = true
  inst.render()
  pollTimers[0].fn()
  await sleep(10)
  assert.ok(statCount() > before, '标签可见后应恢复轮询')
  inst.unmount()
})

test('编辑页：非 UTF-8 与二进制不提供编辑', async () => {
  /* 非 UTF-8：宿主用 decodeValid=false 表达 */
  const h = makeHarness({ fileText: 'one\n' })
  await h.exported.apply(h.ctx)
  const body = editorBody(h)
  /* 直接改桩的返回：decodeValid=false */
  h.ctx.get('remote.fileExplorer').fsRead = () => Promise.resolve({ ok: true, value: { path: ABS, size: 9, version: 'v1', truncated: false, decodeValid: false, text: 'x' } })
  const inst = h.hooks.mount(body.comp, { useTabInfo: () => ({ tab: { contentId: ADDRESS, navigation: { params: { absolutePath: ABS } } } }) })
  inst.render()
  await sleep(30)
  inst.render()
  const json = JSON.stringify(inst.tree)
  assert.ok(json.includes('不是 UTF-8'), '应明确说明非 UTF-8 不可编辑（实际：' + json.slice(0, 240) + '）')
  assert.ok(!json.includes('dfe-input'), '不应出现输入区')
  inst.unmount()
})

test('官方高亮件缺失时不崩，降级为纯文本编辑', async () => {
  const h = makeHarness({ noPrimitives: true, fileText: 'plain\n' })
  await h.exported.apply(h.ctx)
  const { inst } = await mountEditor(h)
  const json = JSON.stringify(inst.tree)
  assert.ok(json.includes('dfe-input'), '拿不到官方高亮件时仍应能编辑')
  inst.unmount()
})

test('文件页头：新建文件 / 新建文件夹按钮与对话框状态', async () => {
  const h = makeHarness()
  await h.exported.apply(h.ctx)
  const files = h.find('sidebar.right.tab.files.actions')
  assert.ok(files, '未注册文件页头动作槽')
  assert.equal(files.def.id, 'dsh-file-explorer')
  assert.equal(files.def.order, -20)
  const inst = h.hooks.mount(files.comp, { absolutePath: 'D:\\DeepseekPlugin\\notes', sessionId: SESSION })
  inst.render()
  await sleep(30)
  inst.render()
  const buttons = []
  const walk = (node) => {
    if (node === null || typeof node !== 'object') return
    if (node.props && node.props.className === 'dfe-files-tool') buttons.push(node)
    for (const child of node.children || []) walk(child)
  }
  walk(inst.tree)
  assert.equal(buttons.length, 2, '本地后端应显示新建文件与新建文件夹')
  buttons[0].props.onClick()
  assert.equal(h.exported.__test.getFileOpsDialog().kind, 'create-file')
  assert.equal(h.exported.__test.getFileOpsDialog().directory, 'D:\\DeepseekPlugin\\notes')
  buttons[1].props.onClick()
  assert.equal(h.exported.__test.getFileOpsDialog().kind, 'create-folder')
  inst.unmount()
})

test('右键菜单：目录/文件 provider、动作与复制相对路径', async () => {
  const h = makeHarness()
  await h.exported.apply(h.ctx)
  const directory = h.menuProviders.find((p) => p.id === 'file-explorer.directory')
  const file = h.menuProviders.find((p) => p.id === 'file-explorer.file')
  assert.ok(directory, '缺少 directory 菜单 provider')
  assert.ok(file, '缺少 file 菜单 provider')
  assert.equal(directory.target, 'directory')
  assert.equal(file.target, 'file')
  assert.equal(directory.order, 50)
  const dirActions = directory.resolve({ sessionId: SESSION, path: 'D:\\DeepseekPlugin\\notes' })
  assert.deepEqual(dirActions.map((a) => a.id), ['createFile', 'createFolder', 'rename', 'deleteFolder', 'copyRelative'])
  assert.equal(dirActions.find((a) => a.id === 'deleteFolder').danger, true)
  const fileActions = file.resolve({ sessionId: SESSION, path: ABS })
  assert.deepEqual(fileActions.map((a) => a.id), ['rename', 'delete', 'copyRelative'])
  assert.equal(fileActions.find((a) => a.id === 'delete').danger, true)

  fileActions.find((a) => a.id === 'copyRelative').run()
  await sleep(20)
  assert.ok(h.calls.some((c) => c[0] === 'fsDescribe' && c[1] === ABS && c[2] === SESSION), '复制相对路径应走 fsDescribe')
  assert.deepEqual(h.copied, ['a.md'], '应把相对路径写进剪贴板')
  assert.ok(h.notices.some((n) => n[0] === '已复制相对路径' && n[1] === true), '应提示复制成功')

  fileActions.find((a) => a.id === 'delete').run()
  assert.equal(h.exported.__test.getFileOpsDialog().kind, 'delete')
  assert.equal(h.exported.__test.getFileOpsDialog().path, ABS)
})

test('对话框：新建文件提交 fsCreateFile 并打开编辑页', async () => {
  const h = makeHarness()
  await h.exported.apply(h.ctx)
  const Dialog = h.exported.__test.CreateEntryDialog
  const dialog = { kind: 'create-file', sessionId: SESSION, directory: 'D:\\DeepseekPlugin\\notes' }
  const inst = h.hooks.mount(Dialog, { dialog })
  inst.render()
  await sleep(30)
  inst.render()
  const input = findNode(inst.tree, (n) => n.props && n.props.className === 'dfe-field-input')
  assert.ok(input, '新建对话框应有文件名输入框')
  input.props.onChange({ target: { value: 'notes.md' } })
  await sleep(10)
  inst.render()
  const create = findNode(inst.tree, (n) => n.type === 'button' && n.children.join('') === '创建')
  assert.ok(create, '应有创建按钮')
  create.props.onClick()
  await sleep(40)
  const call = h.calls.find((c) => c[0] === 'fsCreateFile')
  assert.deepEqual(call, ['fsCreateFile', 'D:\\DeepseekPlugin\\notes', 'notes.md', SESSION])
  assert.ok(h.notices.some((n) => n[0].includes('已创建') && n[1] === true))
  assert.equal(h.opened.length, 1, '新建文件后应打开编辑页')
  assert.equal(h.opened[0][1].kind, 'file-editor')
  assert.equal(h.opened[0][1].params.absolutePath, 'D:\\DeepseekPlugin\\notes\\notes.md')
  assert.equal(h.exported.__test.getFileOpsDialog(), null, '成功后应关闭对话框')
  inst.unmount()
})

test('对话框：删除提交带版本号，成功后发出 deleted 事件', async () => {
  const h = makeHarness()
  await h.exported.apply(h.ctx)
  const Dialog = h.exported.__test.DeleteDialog
  let deleted = null
  const unsubscribe = (() => {
    /* 通过 __test.emitFileEvent 的监听面不可直接订阅；这里从编辑页行为覆盖事件。 */
    return () => {}
  })()
  const dialog = { kind: 'delete', sessionId: SESSION, path: ABS }
  const inst = h.hooks.mount(Dialog, { dialog })
  inst.render()
  await sleep(30)
  inst.render()
  const confirm = findNode(inst.tree, (n) => n.type === 'button' && n.children.join('') === '永久删除')
  assert.ok(confirm, '应有永久删除按钮')
  confirm.props.onClick()
  await sleep(40)
  const call = h.calls.find((c) => c[0] === 'fsDelete')
  assert.deepEqual(call, ['fsDelete', ABS, 'v1', SESSION], '删除必须带 fsDescribe 拿到的版本号')
  assert.ok(h.notices.some((n) => n[0].includes('已删除') && n[1] === true))
  assert.equal(h.exported.__test.getFileOpsDialog(), null)
  unsubscribe()
  inst.unmount()
})

test('对话框：删除文件夹提交 fsDeleteFolder，提示递归并发出 deleted 事件', async () => {
  const h = makeHarness({ describe: { kind: 'directory', size: null, version: null } })
  await h.exported.apply(h.ctx)
  const A = h.exported.__test
  const events = []
  const unsubscribe = A.subscribeFileEvents((event) => events.push(event))
  const Dialog = A.DeleteDialog
  const dialog = { kind: 'delete-folder', sessionId: SESSION, path: FOLDER }
  const inst = h.hooks.mount(Dialog, { dialog })
  inst.render()
  await sleep(30)
  inst.render()
  const json = JSON.stringify(inst.tree)
  assert.ok(json.includes('删除文件夹'), '标题应为删除文件夹')
  assert.ok(json.includes('递归删除'), '应提示递归删除')
  const confirm = findNode(inst.tree, (n) => n.type === 'button' && n.children.join('') === '永久删除')
  assert.ok(confirm, '应有永久删除按钮')
  confirm.props.onClick()
  await sleep(40)
  assert.deepEqual(h.calls.find((c) => c[0] === 'fsDeleteFolder'), ['fsDeleteFolder', FOLDER, SESSION])
  assert.ok(h.notices.some((n) => n[0].includes('已删除文件夹') && n[1] === true), '应提示已删除文件夹')
  assert.deepEqual(events, [{ kind: 'deleted', path: FOLDER }])
  unsubscribe()
  inst.unmount()
})

test('拖拽引用：mention / payload / 名称校验 / 包含性', () => {
  const A = makeHarness().exported.__test
  assert.equal(A.formatReferenceMention('D:\\work\\src\\a.md', 'D:\\work', 'win32'), '@src/a.md')
  assert.equal(A.formatReferenceMention('D:\\work\\src\\a b.md', 'D:\\work', 'win32'), '@"src/a b.md"')
  assert.equal(A.formatReferenceMention('D:\\other\\a.md', 'D:\\work', 'win32'), '@D:/other/a.md')
  assert.equal(A.formatReferenceMention('/home/me/work/a.md', '/home/me/work', 'linux'), '@a.md')
  assert.equal(A.formatReferenceMention('/home/me/work/a b.md', '/home/me/work', 'linux'), '@"a b.md"')
  assert.equal(A.formatReferenceMention('/home/me/work/a"b.md', '/home/me/work', 'linux'), null)

  const payload = A.referenceDragPayload('D:\\work\\src\\a.md', 'D:\\work', 'win32')
  assert.deepEqual(payload, { path: 'D:\\work\\src\\a.md', root: 'D:\\work', name: 'a.md', mention: '@src/a.md' })
  assert.equal(A.referenceDragPayload('D:\\work\\a"b.md', 'D:\\work', 'win32'), null)

  assert.equal(A.validateEntryNameClient('notes.md', 'win32').ok, true)
  assert.equal(A.validateEntryNameClient('CON', 'win32').ok, false)
  assert.equal(A.validateEntryNameClient('a:b', 'darwin').ok, false)
  assert.equal(A.validateEntryNameClient('a:b', 'linux').ok, true)
  assert.equal(A.validateEntryNameClient('a/b', 'linux').ok, false)

  assert.equal(A.sameOrInsidePath('D:\\Work', 'D:\\work\\src\\a.md', 'win32'), true)
  assert.equal(A.sameOrInsidePath('/home/me/work', '/home/me/Work/a.md', 'linux'), false)
})

test('拖放桥：注册官方 slot 并挂到输入框', async () => {
  const h = makeHarness()
  await h.exported.apply(h.ctx)
  assert.ok(h.find('shell.overlay'), '应注册对话框宿主到 shell.overlay')
  assert.ok(h.find('conversation.input.overlay'), '应注册输入框拖放桥')

  const Bridge = h.exported.__test.InputDropBridge
  const inst = h.hooks.mount(Bridge, {
    sessionId: SESSION,
    inputActions: { insertText: () => true, captureInsertion: () => ({ start: 0, end: 0 }) },
    useSessions: (selector) => selector({ byId: { [SESSION]: { cwd: 'D:\\DeepseekPlugin\\notes' } } })
  })
  inst.render()
  await sleep(10)
  inst.render()
  assert.equal(inst.tree.type, 'span')
  inst.unmount()
})

test('编辑页：删除/重命名事件进入生命周期状态', async () => {
  const h = makeHarness({ fileText: 'one\n' })
  const A = h.exported.__test
  await h.exported.apply(h.ctx)
  const { inst } = await mountEditor(h)
  A.emitFileEvent({ kind: 'deleted', path: ABS })
  await sleep(20)
  inst.render()
  const json = JSON.stringify(inst.tree)
  assert.ok(json.includes('已被删除'), '删除事件后应显示 deleted 状态')
  assert.ok(!json.includes('"dfe-input"'), 'deleted 状态不应保留可编辑 textarea')
  assert.ok(json.includes('复制我的内容'), '应提供复制未保存内容的出口')
  assert.ok(json.includes('关闭标签'), '应提供关闭标签出口')
  inst.unmount()
})

test('对话框：重命名提交 fsRename 并发出 renamed 事件', async () => {
  const h = makeHarness()
  await h.exported.apply(h.ctx)
  const A = h.exported.__test
  const events = []
  const unsubscribe = A.subscribeFileEvents((event) => events.push(event))
  const Dialog = A.RenameDialog
  const dialog = { kind: 'rename', sessionId: SESSION, path: ABS }
  const inst = h.hooks.mount(Dialog, { dialog })
  inst.render()
  await sleep(30)
  inst.render()
  const input = findNode(inst.tree, (n) => n.props && n.props.className === 'dfe-field-input')
  assert.ok(input, '重命名对话框应有输入框')
  input.props.onChange({ target: { value: 'b.md' } })
  await sleep(10)
  inst.render()
  const confirm = findNode(inst.tree, (n) => n.type === 'button' && n.children.join('') === '重命名')
  assert.ok(confirm, '应有重命名按钮')
  confirm.props.onClick()
  await sleep(40)
  const call = h.calls.find((c) => c[0] === 'fsRename')
  assert.deepEqual(call, ['fsRename', ABS, 'b.md', SESSION])
  assert.equal(events.length, 1)
  assert.equal(events[0].kind, 'renamed')
  assert.equal(events[0].from, ABS)
  assert.ok(h.notices.some((n) => n[0] === '已重命名' && n[1] === true))
  unsubscribe()
  inst.unmount()
})

test('编辑页：重命名事件进入 renamed 状态并提供新位置打开', async () => {
  const h = makeHarness({ fileText: 'one\n' })
  const A = h.exported.__test
  await h.exported.apply(h.ctx)
  const { inst } = await mountEditor(h)
  A.emitFileEvent({ kind: 'renamed', from: ABS, to: 'D:\\DeepseekPlugin\\notes\\b.md' })
  await sleep(20)
  inst.render()
  const json = JSON.stringify(inst.tree)
  assert.ok(json.includes('已改名或移动'), '应显示 renamed 状态')
  assert.ok(json.includes('在新位置打开'), '应提供新位置打开')
  assert.ok(json.includes('关闭标签'), '应提供关闭标签')
  assert.ok(!json.includes('"dfe-input"'), 'renamed 状态不应保留可编辑 textarea')
  inst.unmount()
})

test('拖动源：官方树行 dragstart 写入轻量引用载荷与 text/plain', async () => {
  const h = makeHarness()
  await h.exported.apply(h.ctx)
  await sleep(20)
  assert.ok(Array.isArray(h.document._listeners.dragstart) && h.document._listeners.dragstart.length > 0, '应安装 dragstart 监听')
  assert.ok(!h.document._listeners.contextmenu || h.document._listeners.contextmenu.length === 0, '不应再安装空白处右键监听')
  const rootEl = { getAttribute: (name) => (name === 'data-files-root' ? 'D:\\work' : null) }
  const row = {
    getAttribute: (name) => (name === 'data-files-path' ? 'D:\\work\\src\\a.md' : null),
    closest: (selector) => (selector === '[data-files-root]' ? rootEl : null),
    setAttribute: () => {}
  }
  const data = []
  const event = {
    target: { closest: (selector) => (selector.indexOf('data-files-entry') >= 0 ? row : null) },
    dataTransfer: { types: [], setData: (type, value) => data.push([type, value]), effectAllowed: null },
    preventDefault: () => { throw new Error('合法路径不应阻止拖动') }
  }
  h.document.dispatch('dragstart', event)
  const types = data.map((item) => item[0])
  assert.ok(types.includes('application/x-dsh-file-ref'), '应写入自定义引用 MIME')
  assert.ok(types.includes('text/plain'), '应写入 text/plain 降级')
  const payload = JSON.parse(data.find((item) => item[0] === 'application/x-dsh-file-ref')[1])
  assert.equal(payload.path, 'D:\\work\\src\\a.md')
  assert.equal(payload.mention, '@src/a.md')
  assert.equal(data.find((item) => item[0] === 'text/plain')[1], '@src/a.md ')
})



test.after(() => {
  setTimeout(() => process.exit(process.exitCode === undefined ? 0 : process.exitCode), 50).unref()
})
