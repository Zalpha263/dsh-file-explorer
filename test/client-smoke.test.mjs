// dsh-file-explorer — 客户端半区冒烟测试（零依赖，node:test）
//
// 为什么必须有：客户端是手写的 __ModuleLoader__ bundle，`node --check` 只能证明
// "能解析"，证明不了"能挂载"（本项目吃过一次亏：语法通过、面板一片空白）。
// 这里用一个最小 DOM + 最小 hooks 运行时把真实 bundle 跑起来，覆盖：
//   ① bundle 注册与导出
//   ② remote 贡献只有 fsStat/fsRead/fsWrite（旧的文件操作接口必须消失）
//   ③ apply 的注册面：官方预览头部动作槽 + 编辑页标签类型（不声明 patterns）
//      + 编辑页正文 + 标签标题
//   ④ 「编辑」按钮 → ctx.sidebarRight.openResource(地址, { kind:'file-editor',
//      params:{ absolutePath } })
//   ⑤ 编辑页：读文件 → 渲染行号与输入区 → Ctrl+S → 用正确版本号写回
//
// 运行：node test/client-smoke.test.mjs

import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const SOURCE = fs.readFileSync(path.join(here, '..', 'lib', 'client.js'), 'utf8')

/* ---------------- 最小 DOM ---------------- */
function makeEl(tag) {
  const el = {
    tagName: String(tag).toUpperCase(), children: [], style: {}, dataset: {}, handlers: {}, _text: '', _attrs: {},
    value: '', disabled: false, spellCheck: true, scrollTop: 0, scrollLeft: 0, scrollHeight: 320, title: '',
    classList: {
      _s: new Set(),
      add(...c) { c.forEach((x) => this._s.add(x)) },
      remove(...c) { c.forEach((x) => this._s.delete(x)) },
      toggle(c, on) { const v = on === undefined ? !this._s.has(c) : on; if (v) this._s.add(c); else this._s.delete(c); return v },
      contains(c) { return this._s.has(c) }
    },
    get className() { return Array.from(this.classList._s).join(' ') },
    set className(v) { this.classList._s = new Set(String(v).split(/\s+/).filter(Boolean)) },
    get textContent() { return this.children.length === 0 ? this._text : this._text + this.children.map((c) => c.textContent).join('') },
    set textContent(v) { this._text = String(v); this.children = [] },
    appendChild(c) { this.children.push(c); return c },
    removeChild(c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); return c },
    setAttribute(k, v) { this._attrs[k] = String(v) },
    getAttribute(k) { return this._attrs[k] !== undefined ? this._attrs[k] : null },
    addEventListener(k, fn) { (this.handlers[k] = this.handlers[k] || []).push(fn) },
    removeEventListener() {},
    dispatch(k, ev) { for (const fn of (this.handlers[k] || []).slice()) fn(Object.assign({ preventDefault() {}, stopPropagation() {}, target: this, currentTarget: this }, ev)) },
    click() { this.dispatch('click') },
    focus() {}, select() {}, setSelectionRange() {},
    querySelector(sel) { return this.querySelectorAll(sel)[0] || null },
    querySelectorAll(sel) {
      const out = []
      const want = sel.replace(/^style\[data-plugin-css="([^"]+)"\]$/, '$1')
      const walk = (n) => {
        for (const c of n.children) {
          if (sel.startsWith('style[')) { if (c.tagName === 'STYLE' && c.dataset.pluginCss === want) out.push(c) }
          else if (sel.startsWith('.') && c.classList.contains(sel.slice(1))) out.push(c)
          walk(c)
        }
      }
      walk(this)
      return out
    },
    remove() {}, contains() { return true }, closest() { return null },
    getBoundingClientRect() { return { left: 0, top: 0, width: 400, height: 300 } }
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
  doc.addEventListener = () => {}
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
      if (prev !== undefined && sameDeps(prev.deps, deps)) return
      slots.effects[i] = { fn, deps, fresh: true }
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
          /* 下标赋值会留下空洞（稀疏数组），for...of 会产出 undefined。 */
          if (slot === undefined || slot.fresh !== true) continue
          slot.fresh = false
          const cleanup = slot.fn()
          slots.cleanups.push(cleanup)
          if (dirty) break
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
  const window = {
    __ModuleLoader__: { load: (e) => { entry = e } },
    addEventListener() {}, removeEventListener() {},
    setInterval: (fn, ms) => setInterval(fn, ms), clearInterval: (id) => clearInterval(id),
    setTimeout: (fn, ms) => setTimeout(fn, ms), clearTimeout: (id) => clearTimeout(id),
    requestAnimationFrame: (fn) => setTimeout(() => fn(Date.now()), 0),
    innerWidth: 1400, innerHeight: 900,
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} }
  }
  const React = {
    createElement: (type, props, ...children) => ({ type, props: props || {}, children: children.flat().filter((c) => c !== null && c !== undefined && c !== false) }),
    useMemo: (fn) => fn(), // 上面 mount 时会用真实 hooks 覆盖；这里只是兜底
    useState: (v) => [v, () => {}],
    useRef: (v) => ({ current: v }),
    useCallback: (fn) => fn,
    useEffect: () => {}
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
  const globals = {
    window, document,
    navigator: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', clipboard: { writeText: () => Promise.resolve() } },
    requestAnimationFrame: window.requestAnimationFrame,
    localStorage: window.localStorage
  }
  // 在函数体内运行 bundle 源码，让 window.__ModuleLoader__.load 被调用
  const factory = new Function(...Object.keys(globals), SOURCE)
  factory(...Object.values(globals))
  assert.ok(entry !== null, 'bundle 未调用 __ModuleLoader__.load')
  const exported = entry.factory(requireStub)
  return { entry, exported, document, hooks }
}

/** 官方高亮件的替身：语言表与 useCodeHighlighter 都要在（验证我们真用了官方接口）。 */
const PRIMITIVES_STUB = {
  languageForPath: (p) => (/\.(md|markdown)$/i.test(p) ? 'markdown' : /\.(js|mjs|cjs)$/i.test(p) ? 'javascript' : undefined),
  useCodeHighlighter: () => (code) => String(code).split('\n').map((line) => [{ text: line, style: { color: '#abc' } }])
}

/* ---------------- 宿主桩 ---------------- */
const ABS = 'D:\\DeepseekPlugin\\notes\\a.md'
const SESSION = 'sess-1'
const ADDRESS = 'dsh-resource://file/session/sess-1/notes/a.md'
function makeHarness(opts = {}) {
  const { exported, document, hooks } = loadBundle(opts.noPrimitives ? null : PRIMITIVES_STUB)
  const registered = []
  const opened = []
  const calls = []
  const mounted = []
  const ok = (value) => Promise.resolve({ ok: true, value })
  const namespace = {
    fsStat: (p) => { calls.push(['fsStat', p]); return ok({ path: p, type: 'file', size: 42, version: opts.statVersion || 'v1' }) },
    fsRead: (p, maxBytes) => {
      calls.push(['fsRead', p])
      if (opts.readFails) return Promise.resolve({ ok: false, error: { message: 'read failed' } })
      return ok({ path: p, size: 42, version: 'v1', truncated: false, decodeValid: true, text: opts.fileText || 'line one\nline two\n' })
    },
    fsWrite: (p, content, version) => { calls.push(['fsWrite', p, content, version]); return ok({ path: p, version: 'v2', size: content.length }) }
  }
  const slots = {
    inject: (name, cb) => { const d = cb ? cb() : undefined; return typeof d === 'function' ? d : () => {} },
    register: (def, comp) => { registered.push({ def, comp }); return () => {} }
  }
  const tabs = { register: (def) => { registered.push({ def, comp: null }); return () => {} } }
  const sidebarRight = { openResource: (address, options) => { opened.push([address, options]) } }
  const ctx = {
    effect: (fn) => { const d = fn(); return () => { if (typeof d === 'function') d() } },
    get: (k) => (k === 'slots' ? slots : (k === 'sidebarRightTabs' ? tabs : (k === 'sidebarRight' ? sidebarRight : (k === 'remote.fileExplorer' ? namespace : undefined)))),
    inject: (deps, cb) => { if (cb) cb(); return () => {} },
    remote: { $mount: async (c) => { mounted.push(c); return () => {} } },
    /* cordis 把服务同时挂成 ctx.<serviceName>；官方插件（如 ui-open-in-app）
       用的就是 ctx.slots.* 这种属性写法，所以桩也要给属性，否则测不出真实调用面。 */
    slots: slots,
    sidebarRightTabs: tabs,
    sidebarRight: sidebarRight
  }
  return { exported, ctx, document, hooks, registered, opened, calls, mounted, find: (name) => registered.find((r) => r.def.name === name), all: (name) => registered.filter((r) => r.def.name === name) }
}

/* ---------------- 用例 ---------------- */
test('bundle 注册与导出', () => {
  const { entry, exported } = loadBundle(PRIMITIVES_STUB)
  assert.equal(entry.id, 'dsh-file-explorer')
  assert.equal(typeof exported.apply, 'function')
  assert.deepEqual(exported.inject, ['slots', 'remote'])
})

test('remote 贡献只剩三个方法（旧的文件夹操作必须消失）', async () => {
  const h = makeHarness()
  await h.exported.apply(h.ctx)
  assert.equal(h.mounted.length, 1)
  const methods = h.mounted[0].descriptors.map((d) => d.method)
  assert.deepEqual(methods, ['fsStat', 'fsRead', 'fsWrite'])
  for (const gone of ['fsList', 'fsRender', 'fsCreate', 'fsRename', 'fsCopy', 'fsDelete', 'fsMove', 'wsRoot', 'wsList']) {
    assert.ok(!methods.includes(gone), gone + ' 应已从贡献中移除')
  }
  for (const d of h.mounted[0].descriptors) {
    assert.equal(d.result.mode, 'strict')
    assert.equal(typeof d.result.create, 'function')
  }
})

test('注册面：官方预览动作槽 + 编辑页类型（不抢默认打开）+ 正文 + 标题', async () => {
  const h = makeHarness()
  await h.exported.apply(h.ctx)

  const action = h.find('sidebar.right.tab.document.actions')
  assert.ok(action, '未注册到官方预览头部的动作槽')
  assert.equal(action.def.id, 'dsh-file-explorer')

  const type = h.registered.find((r) => r.def.kind === 'file-editor')
  assert.ok(type, '未注册 file-editor 标签类型')
  assert.equal(type.def.id, 'file-editor')
  assert.equal(type.def.patterns, undefined, '不得声明 patterns（否则会抢走官方的默认打开）')
  assert.equal(typeof type.def.canOpen, 'function')
  assert.equal(type.def.canOpen(ADDRESS), true)
  assert.equal(type.def.canOpen('dsh-resource://other/x'), false)
  assert.equal(type.def.title(ADDRESS), '编辑 · a.md')

  const body = h.all('sidebar.right.pane.tab').find((r) => r.def.key === 'file-editor')
  assert.ok(body, '未注册编辑页正文')
  assert.equal(typeof body.comp, 'function')
  const title = h.all('sidebar.right.pane.tab.title').find((r) => r.def.key === 'file-editor')
  assert.ok(title, '未注册编辑页标题')
})

test('「编辑」按钮：用同一资源地址 + kind=file-editor 打开（并带上绝对路径）', async () => {
  const h = makeHarness()
  await h.exported.apply(h.ctx)
  const action = h.find('sidebar.right.tab.document.actions')
  const tree = action.comp({ absolutePath: ABS, sessionId: SESSION })
  assert.ok(tree, '按钮组件没有渲染')
  assert.equal(tree.type, 'button')
  assert.equal(tree.children.join(''), '编辑')
  tree.props.onClick()
  assert.equal(h.opened.length, 1, '应调用一次 openResource')
  const [address, options] = h.opened[0]
  assert.match(address, /^dsh-resource:\/\/file\/session\/sess-1\//)
  assert.match(address, /notes\/a\.md$/)
  assert.equal(options.kind, 'file-editor', '必须强制用我们的 kind 打开')
  assert.equal(options.params.absolutePath, ABS, '绝对路径要经 navigation.params 传给编辑页')
})

test('编辑页：读文件 → 渲染行号与输入区', async () => {
  const h = makeHarness({ fileText: 'alpha\nbeta\ngamma\n' })
  await h.exported.apply(h.ctx)
  const body = h.all('sidebar.right.pane.tab').find((r) => r.def.key === 'file-editor')
  const inst = h.hooks.mount(body.comp, {
    useTabInfo: () => ({ tab: { contentId: ADDRESS, navigation: { params: { absolutePath: ABS } } } })
  })
  inst.render()
  await new Promise((r) => setTimeout(r, 30))
  inst.render()
  const tree = inst.tree
  assert.ok(tree, '编辑页没有渲染')
  assert.ok(h.calls.some((c) => c[0] === 'fsRead'), '应读取文件')
  const json = JSON.stringify(tree)
  assert.ok(json.includes('line one') || json.includes('alpha'), '渲染结果里应有文件内容（实际：' + json.slice(0, 300) + '）')
  assert.ok(json.includes('dfe-gutter'), '应有行号 gutter')
  assert.ok(json.includes('dfe-input'), '应有输入区')
  inst.unmount()
})

test('编辑页：Ctrl+S 用打开时的版本号写回', async () => {
  const h = makeHarness({ fileText: 'one\n' })
  await h.exported.apply(h.ctx)
  const body = h.all('sidebar.right.pane.tab').find((r) => r.def.key === 'file-editor')
  const inst = h.hooks.mount(body.comp, {
    useTabInfo: () => ({ tab: { contentId: ADDRESS, navigation: { params: { absolutePath: ABS } } } })
  })
  inst.render()
  await new Promise((r) => setTimeout(r, 30))
  inst.render()

  const find = (node, pred) => {
    if (node === null || typeof node !== 'object') return null
    if (pred(node)) return node
    for (const c of node.children || []) { const hit = find(c, pred); if (hit) return hit }
    return null
  }
  const input = find(inst.tree, (n) => n.props && n.props.className === 'dfe-input')
  assert.ok(input, '找不到输入区')
  input.props.onChange({ target: { value: 'one changed\n' } })
  await new Promise((r) => setTimeout(r, 10))
  inst.render()
  const input2 = find(inst.tree, (n) => n.props && n.props.className === 'dfe-input')
  input2.props.onKeyDown({ key: 's', ctrlKey: true, preventDefault() {}, target: { selectionStart: 0, selectionEnd: 0 } })
  await new Promise((r) => setTimeout(r, 30))
  const write = h.calls.find((c) => c[0] === 'fsWrite')
  assert.ok(write, 'Ctrl+S 应触发写回')
  assert.equal(write[1], ABS)
  assert.equal(write[2], 'one changed\n', '写回内容应是编辑后的文本')
  assert.equal(write[3], 'v1', '写回必须带打开时的版本号（陈旧守卫）')
  inst.unmount()
})

test('编辑页：非 UTF-8 与二进制不提供编辑', async () => {
  for (const [opts, expectText] of [
    [{ fileText: 'x', readFails: false }, null]
  ]) { void opts; void expectText }
  /* 非 UTF-8：宿主用 decodeValid=false 表达 */
  const h = makeHarness({ fileText: 'one\n' })
  await h.exported.apply(h.ctx)
  const body = h.all('sidebar.right.pane.tab').find((r) => r.def.key === 'file-editor')
  /* 直接改桩的返回：decodeValid=false */
  h.ctx.get('remote.fileExplorer').fsRead = () => Promise.resolve({ ok: true, value: { path: ABS, size: 9, version: 'v1', truncated: false, decodeValid: false, text: 'x' } })
  const inst = h.hooks.mount(body.comp, { useTabInfo: () => ({ tab: { contentId: ADDRESS, navigation: { params: { absolutePath: ABS } } } }) })
  inst.render()
  await new Promise((r) => setTimeout(r, 30))
  inst.render()
  const json = JSON.stringify(inst.tree)
  assert.ok(json.includes('不是 UTF-8'), '应明确说明非 UTF-8 不可编辑（实际：' + json.slice(0, 240) + '）')
  assert.ok(!json.includes('dfe-input'), '不应出现输入区')
  inst.unmount()
})

test('官方高亮件缺失时不崩，降级为纯文本编辑', async () => {
  const h = makeHarness({ noPrimitives: true, fileText: 'plain\n' })
  await h.exported.apply(h.ctx)
  const body = h.all('sidebar.right.pane.tab').find((r) => r.def.key === 'file-editor')
  const inst = h.hooks.mount(body.comp, { useTabInfo: () => ({ tab: { contentId: ADDRESS, navigation: { params: { absolutePath: ABS } } } }) })
  inst.render()
  await new Promise((r) => setTimeout(r, 30))
  inst.render()
  const json = JSON.stringify(inst.tree)
  assert.ok(json.includes('dfe-input'), '拿不到官方高亮件时仍应能编辑')
  inst.unmount()
})

test.after(() => {
  setTimeout(() => process.exit(process.exitCode === undefined ? 0 : process.exitCode), 50).unref()
})
