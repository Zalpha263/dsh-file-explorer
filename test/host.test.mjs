// dsh-file-explorer — 宿主半区集成测试（真实 cordis Context + 真实文件系统）
//
// v2.0.0 的宿主只剩三件事：fsStat（元数据/版本）、fsRead（文本 + 文本性判定）、
// fsWrite（带乐观并发校验的写回）。本套覆盖：
//   · 服务注册面（旧的文件操作接口必须消失）
//   · 读：文本 + 版本令牌 + 截断标记；二进制与「非 UTF-8」都被识别且拒绝编辑
//   · 写：正常写回、陈旧版本被拒、工作区边界、沙箱拒绝的错误映射
// ctx.fs 用最小桩实现（resolve/stat/streamText/writeText），
// 足以驱动真实代码路径。
//
// 运行：node test/host.test.mjs

import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Context } from '@deepseek-ai/cordis'
import { apply } from '../lib/index.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const TMP = path.join(here, '.tmp-host')

/** 最小 ctx.fs 桩：契约与 dsh-fs 一致（target 对象带 displayPath）。 */
function makeFsStub(state) {
  const of = (target) => String(target)
  const versions = new Map()
  const currentVersion = (file, size) => 'ver:' + (versions.get(file) || 0) + ':' + size
  const bump = (file, size) => {
    const next = (versions.get(file) || 0) + 1
    versions.set(file, next)
    return 'ver:' + next + ':' + size
  }
  return {
    resolve: (p) => Promise.resolve(String(p)),
    /* 本地后端标记：目录操作会直接落到真实临时目录。 */
    processPathFromHostPath: (p) => path.isAbsolute(String(p)) ? String(p) : undefined,
    stat: async (target) => {
      const file = of(target)
      if (state.hideFile === file) return undefined
      try {
        const st = await fs.stat(file)
        return {
          type: st.isDirectory() ? 'directory' : 'file',
          size: st.size,
          version: currentVersion(file, st.size)
        }
      } catch (err) {
        return undefined
      }
    },
    lstat: async (p) => {
      try {
        const st = await fs.lstat(String(p))
        return {
          type: st.isSymbolicLink() ? 'symlink' : st.isDirectory() ? 'directory' : st.isFile() ? 'file' : 'other',
          size: st.size,
          version: currentVersion(String(p), st.size)
        }
      } catch (err) {
        return undefined
      }
    },
    deleteFile: async (target, expected) => {
      const file = of(target)
      const st = await fs.stat(file).catch(() => null)
      if (st === null) {
        const err = new Error('gone')
        err.code = 'FS_NOT_FOUND'
        throw err
      }
      if (expected && typeof expected.version === 'string' && expected.version !== '') {
        if (currentVersion(file, st.size) !== expected.version) {
          const err = new Error('stale')
          err.code = 'FS_STALE_VERSION'
          throw err
        }
      }
      await fs.unlink(file)
      return { before: null }
    },
    streamText: (target) => (async function* () {
      const file = of(target)
      if (state.notText === file) {
        const err = new Error('not text')
        err.code = 'FS_NOT_TEXT'
        throw err
      }
      yield state.streamOverride !== null ? state.streamOverride : await fs.readFile(file, 'utf8')
    })(),
    writeText: async (target, content, intent) => {
      const file = of(target)
      if (state.denyWrite === file) {
        const err = new Error('denied')
        err.code = 'FS_SANDBOX_DENIED'
        throw err
      }
      const exists = await fs.stat(file).then(() => true).catch(() => false)
      if (intent && intent.kind === 'createIfAbsent' && exists) {
        const err = new Error('exists')
        err.code = 'FS_NOT_OBSERVED'
        throw err
      }
      if (intent && intent.kind === 'replaceIfVersion') {
        if (!exists) { const err = new Error('gone'); err.code = 'FS_NOT_FOUND'; throw err }
        const current = currentVersion(file, (await fs.stat(file)).size)
        if (current !== intent.version) { const err = new Error('stale'); err.code = 'FS_STALE_VERSION'; throw err }
      }
      await fs.writeFile(file, content, 'utf8')
      const st = await fs.stat(file)
      return { version: bump(file, st.size) }
    }
  }
}

function bootHost(state = {}) {
  const opts = Object.assign({ hideFile: null, notText: null, streamOverride: null, denyWrite: null, sessions: null, agents: null, policyCalls: [] }, state)
  const ctx = new Context()
  /* 会话策略桩：带 session 时返回该会话的 cwd 作为根（真实 dsh-sandbox-policy
     就是这样把 session.header.cwd 当 workspace-write 边界的）。 */
  ctx.provide('sandboxPolicy', {
    workspaceRoot: TMP,
    resolve: (request) => {
      opts.policyCalls.push(request)
      const session = request && request.session
      const root = session && session.header && typeof session.header.cwd === 'string' ? session.header.cwd : TMP
      return { mode: 'workspace-write', workspaceRoot: root, root }
    }
  })
  /* sessions 服务桩：真实 dsh-session 的 `ctx.get('sessions').get(id)` 返回
     live session（含 header.cwd），找不到返回 undefined。 */
  ctx.provide('sessions', {
    get: (id) => {
      const map = opts.sessions
      if (map === null || map === undefined) return undefined
      if (typeof map.get === 'function') return map.get(id)
      return map[id]
    }
  })
  if (opts.agents !== null) ctx.provide('agents', opts.agents)
  ctx.provide('fs', makeFsStub(opts))
  apply(ctx)
  const svc = ctx.get('fileExplorer')
  assert.ok(svc, 'fileExplorer 服务未注册')
  return { ctx, svc, state: opts }
}

function makeSession(id, cwd) {
  return { id, header: { cwd } }
}

async function seed() {
  await fs.rm(TMP, { recursive: true, force: true })
  await fs.mkdir(TMP, { recursive: true })
  await fs.writeFile(path.join(TMP, 'a.md'), '# 标题\n第二行\n', 'utf8')
}

test('启动：编辑三方法 + 文件管理七方法，旧批量接口消失', async () => {
  await seed()
  const { svc } = bootHost()
  for (const method of [
    'fsStat', 'fsRead', 'fsWrite',
    'fsEnvironment', 'fsDescribe', 'fsCreateFile', 'fsCreateFolder', 'fsRename', 'fsDelete', 'fsDeleteFolder'
  ]) {
    assert.equal(typeof svc[method], 'function', method + ' 应已注册')
  }
  for (const gone of ['fsList', 'fsRender', 'fsCopy', 'fsMove', 'wsRoot', 'wsList', 'fsRestore', 'fsSearchName', 'fsGrep', 'fsBatch']) {
    assert.equal(svc[gone], undefined, gone + ' 应已删除')
  }
})

test('读：返回文本、版本令牌、文本性判定', async () => {
  const { svc } = bootHost()
  const res = await svc.fsRead(path.join(TMP, 'a.md'))
  assert.equal(res.text, '# 标题\n第二行\n')
  assert.ok(typeof res.version === 'string' && res.version !== '', '应带版本令牌')
  assert.equal(res.truncated, false)
  assert.equal(res.decodeValid, true)
  assert.equal(res.binary, undefined)
  assert.equal(res.size > 0, true)
  assert.equal('path' in res, false, '响应不应再带未使用的 path 字段')
})

test('读：截断标记与 UTF-8 安全切片（截断点落在代理对中间也不劈开 emoji）', async () => {
  const file = path.join(TMP, 'big.txt')
  await fs.writeFile(file, 'a'.repeat(1023) + '😀' + 'b'.repeat(4000), 'utf8')
  const { svc } = bootHost()
  const res = await svc.fsRead(file, 1024)
  assert.equal(res.truncated, true)
  assert.equal(res.text.length <= 1024, true)
  assert.equal(/[\uD800-\uDBFF]$/.test(res.text), false, '不得以孤立高位代理结尾')
})

test('读：二进制与「非 UTF-8」都被识别（后者拒绝编辑的理由）', async () => {
  const binFile = path.join(TMP, 'logo.png')
  await fs.writeFile(binFile, Buffer.from([0x89, 0x50, 0x4e, 0x47]))

  /* 二进制：后端抛 FS_NOT_TEXT */
  const binaryHost = bootHost({ notText: binFile })
  const binary = await binaryHost.svc.fsRead(binFile)
  assert.equal(binary.binary, true)
  assert.equal(binary.text, undefined)

  /* 非 UTF-8：文本里出现替换字符（GBK / UTF-16 / CP1252 解码后的样子） */
  const gbkFile = path.join(TMP, 'gbk.txt')
  await fs.writeFile(gbkFile, 'placeholder', 'utf8')
  const badHost = bootHost({ streamOverride: '中文乱码\ufffd\ufffd tail' })
  const bad = await badHost.svc.fsRead(gbkFile)
  assert.equal(bad.decodeValid, false, '出现 U+FFFD 应判定为非 UTF-8')
  assert.equal(bad.binary, undefined)
})

test('读：不存在与不是文件都会报错', async () => {
  const { svc } = bootHost()
  await assert.rejects(() => svc.fsRead(path.join(TMP, 'nope.md')), /not found/)
  await assert.rejects(() => svc.fsRead(TMP), /not a file/)
  await assert.rejects(() => svc.fsRead(''), /path is required/)
})

test('写：正常写回并返回新版本；陈旧版本被拒绝', async () => {
  const file = path.join(TMP, 'a.md')
  const { svc } = bootHost()
  const read = await svc.fsRead(file)
  const wrote = await svc.fsWrite(file, '# 改过了\n', read.version)
  assert.ok(typeof wrote.version === 'string')
  assert.notEqual(wrote.version, read.version, '写入后版本必须变化')
  assert.equal(await fs.readFile(file, 'utf8'), '# 改过了\n')
  assert.deepEqual(Object.keys(wrote), ['version'], '写回只返回版本令牌')
  await assert.rejects(() => svc.fsWrite(file, '# 再改\n', read.version), /stale/)
  assert.equal(await fs.readFile(file, 'utf8'), '# 改过了\n', '陈旧写入不得落盘')
})

test('写：空版本号（新文件场景）为无条件写入', async () => {
  const file = path.join(TMP, 'fresh.txt')
  const { svc } = bootHost()
  const wrote = await svc.fsWrite(file, 'hello\n', '')
  assert.ok(typeof wrote.version === 'string')
  assert.equal(await fs.readFile(file, 'utf8'), 'hello\n')
})

test('写：工作区之外被拒绝（词法 + realpath 双重边界）', async () => {
  const outside = path.join(here, 'outside.txt')
  await fs.writeFile(outside, 'x', 'utf8')
  try {
    const { svc } = bootHost()
    await assert.rejects(() => svc.fsWrite(outside, 'y', ''), /不在当前工作区内/)
    assert.equal(await fs.readFile(outside, 'utf8'), 'x', '工作区外的文件不得被改动')
  } finally {
    await fs.rm(outside, { force: true })
  }
})

test('写：沙箱拒绝映射成可读文案', async () => {
  const file = path.join(TMP, 'locked.txt')
  await fs.writeFile(file, 'x', 'utf8')
  const { svc } = bootHost({ denyWrite: file })
  await assert.rejects(() => svc.fsWrite(file, 'y', ''), /沙箱策略不允许写入/)
})

test('stat：返回版本与大小，供编辑页轮询外部改动', async () => {
  const file = path.join(TMP, 'a.md')
  const { svc } = bootHost()
  const before = await svc.fsStat(file)
  assert.equal(before.type, 'file')
  assert.ok(before.size > 0)
  assert.equal('path' in before, false, 'stat 响应不应再带未使用的 path 字段')
  const read = await svc.fsRead(file)
  const after = await svc.fsStat(file)
  assert.equal(after.version, read.version, 'stat 与 read 必须给出同一族的版本令牌（陈旧守卫依赖它）')
  await assert.rejects(() => svc.fsStat(path.join(TMP, 'nope.md')), /not found/)
})

test('会话：带 sessionId 时读/写/策略都取该会话的 cwd（两个不同 cwd 各用各的根）', async () => {
  const dirA = path.join(here, '.tmp-session-a')
  const dirB = path.join(here, '.tmp-session-b')
  await fs.rm(dirA, { recursive: true, force: true })
  await fs.rm(dirB, { recursive: true, force: true })
  await fs.mkdir(dirA, { recursive: true })
  await fs.mkdir(dirB, { recursive: true })
  await fs.writeFile(path.join(dirA, 'a.md'), 'A\n', 'utf8')
  await fs.writeFile(path.join(dirB, 'b.md'), 'B\n', 'utf8')
  try {
    const sessions = new Map([
      ['sess-a', makeSession('sess-a', dirA)],
      ['sess-b', makeSession('sess-b', dirB)]
    ])
    const { svc, state } = bootHost({ sessions })

    /* 读：相对路径按各自会话的 cwd 解析，而不是"最近根会话"或部署默认根。 */
    assert.equal((await svc.fsRead('a.md', undefined, 'sess-a')).text, 'A\n')
    assert.equal((await svc.fsRead('b.md', undefined, 'sess-b')).text, 'B\n')
    assert.equal((await svc.fsStat('a.md', 'sess-a')).type, 'file')

    /* 写：A 会话写自己根内成功。 */
    const wroteA = await svc.fsWrite(path.join(dirA, 'a.md'), 'A2\n', '', 'sess-a')
    assert.ok(typeof wroteA.version === 'string')
    assert.equal(await fs.readFile(path.join(dirA, 'a.md'), 'utf8'), 'A2\n')

    /* A 会话写 B 的根被拒：边界取 A 的 cwd。 */
    await assert.rejects(() => svc.fsWrite(path.join(dirB, 'b.md'), 'x', '', 'sess-a'), /不在当前工作区内/)
    assert.equal(await fs.readFile(path.join(dirB, 'b.md'), 'utf8'), 'B\n')

    /* B 会话写自己根内成功：该根在部署默认根 TMP 之外，若仍用 TMP 会误拒。 */
    await svc.fsWrite(path.join(dirB, 'b.md'), 'B2\n', '', 'sess-b')
    assert.equal(await fs.readFile(path.join(dirB, 'b.md'), 'utf8'), 'B2\n')

    /* 沙箱策略必须拿到对应会话（不是"最近根会话"的猜测）。 */
    assert.ok(state.policyCalls.some((request) => request && request.session && request.session.id === 'sess-a'), '策略未收到 sess-a')
    assert.ok(state.policyCalls.some((request) => request && request.session && request.session.id === 'sess-b'), '策略未收到 sess-b')

    /* 不传 sessionId 的旧调用保持 2.0.0 行为：根仍是 TMP → 会话目录在 TMP 外被拒。 */
    await assert.rejects(() => svc.fsWrite(path.join(dirA, 'a.md'), 'old', ''), /不在当前工作区内/)
    await svc.fsWrite(path.join(TMP, 'a.md'), '# 旧调用\n', '')

    /* 带未知 sessionId 必须显式报错，绝不回落到"最近根会话"。 */
    await assert.rejects(() => svc.fsWrite(path.join(TMP, 'a.md'), 'x', '', 'nope'), /session not found/)
  } finally {
    await fs.rm(dirA, { recursive: true, force: true })
    await fs.rm(dirB, { recursive: true, force: true })
  }
})

test('旧调用：无 sessionId 时用 agents.roots() 的最近根会话解析路径与写根', async () => {
  const dir = path.join(here, '.tmp-legacy')
  await fs.rm(dir, { recursive: true, force: true })
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(path.join(dir, 'a.md'), 'legacy\n', 'utf8')
  const session = makeSession('live', dir)
  try {
    const { svc, state } = bootHost({ agents: { roots: () => [{ session }] } })
    assert.equal((await svc.fsRead('a.md')).text, 'legacy\n', '相对路径应落到最近根会话的 cwd')
    const wrote = await svc.fsWrite(path.join(dir, 'a.md'), 'legacy2\n', '')
    assert.ok(typeof wrote.version === 'string')
    assert.equal(await fs.readFile(path.join(dir, 'a.md'), 'utf8'), 'legacy2\n')
    assert.ok(state.policyCalls.some((request) => request && request.session && request.session.id === 'live'), '沙箱策略应收到最近根会话')
  } finally {
    await fs.rm(dir, { recursive: true, force: true })
  }
})

test('environment：平台、分隔符、本地后端与会话根', async () => {
  const h = bootHost({ sessions: new Map([['s1', makeSession('s1', TMP)]]) })
  const env = await h.svc.fsEnvironment('s1')
  assert.equal(env.platform, process.platform === 'win32' ? 'win32' : process.platform === 'darwin' ? 'darwin' : 'linux')
  assert.equal(env.separator, process.platform === 'win32' ? '\\' : '/')
  assert.equal(env.caseSensitive, process.platform === 'linux')
  assert.equal(env.localBackend, true)
  assert.equal(env.cwd, TMP)
  assert.equal(env.workspaceRoot, TMP)
  await assert.rejects(() => h.svc.fsEnvironment('nope'), /session not found/)
})

test('describe：native / relative / 类型 / 版本；missing 与越界都不抛', async () => {
  await seed()
  const h = bootHost({ sessions: new Map([['s1', makeSession('s1', TMP)]]) })
  const file = path.join(TMP, 'a.md')
  const info = await h.svc.fsDescribe(file, 's1')
  assert.equal(info.name, 'a.md')
  assert.equal(info.directory, TMP)
  assert.equal(info.relative, 'a.md')
  assert.equal(info.kind, 'file')
  assert.equal(info.exists, true)
  assert.equal(info.link, false)
  assert.equal(info.insideWorkspace, true)
  assert.ok(typeof info.version === 'string' && info.version !== '')
  assert.equal(info.native, path.normalize(file))

  const missing = await h.svc.fsDescribe(path.join(TMP, 'nope.txt'), 's1')
  assert.equal(missing.exists, false)
  assert.equal(missing.kind, null)
  assert.equal(missing.relative, 'nope.txt')
  assert.equal(missing.insideWorkspace, true)

  const outside = await h.svc.fsDescribe(path.join(here, 'outside.txt'), 's1')
  assert.equal(outside.insideWorkspace, false)
  assert.equal(outside.relative, null)
})

test('createFile：createIfAbsent 成功、同名/非法名/越界拒绝', async () => {
  await seed()
  const h = bootHost({ sessions: new Map([['s1', makeSession('s1', TMP)]]) })
  const created = await h.svc.fsCreateFile(TMP, '新建 文件.md', 's1')
  assert.equal(created.name, '新建 文件.md')
  assert.equal(await fs.readFile(path.join(TMP, '新建 文件.md'), 'utf8'), '')
  assert.ok(typeof created.version === 'string')
  await assert.rejects(() => h.svc.fsCreateFile(TMP, '新建 文件.md', 's1'), /同名文件\/文件夹已存在/)
  await assert.rejects(() => h.svc.fsCreateFile(TMP, 'a/b.txt', 's1'), /路径分隔符/)
  await assert.rejects(() => h.svc.fsCreateFile(TMP, '..', 's1'), /不能是/)
  const outside = path.join(here, '.tmp-outside')
  await fs.rm(outside, { recursive: true, force: true })
  await fs.mkdir(outside, { recursive: true })
  try {
    await assert.rejects(() => h.svc.fsCreateFile(outside, 'x.txt', 's1'), /父目录|工作区/)
  } finally {
    await fs.rm(outside, { recursive: true, force: true })
  }
})

test('createFolder / rename：本地后端真实落盘，重复与越界拒绝', async () => {
  await seed()
  const h = bootHost({ sessions: new Map([['s1', makeSession('s1', TMP)]]) })
  await h.svc.fsCreateFolder(TMP, '子目录', 's1')
  const st = await fs.stat(path.join(TMP, '子目录'))
  assert.equal(st.isDirectory(), true)
  await assert.rejects(() => h.svc.fsCreateFolder(TMP, '子目录', 's1'), /同名文件\/文件夹已存在/)

  await fs.writeFile(path.join(TMP, 'r.md'), 'x', 'utf8')
  const renamed = await h.svc.fsRename(path.join(TMP, 'r.md'), 'R.md', 's1')
  assert.equal(renamed.name, 'R.md')
  assert.equal(await fs.readFile(path.join(TMP, 'R.md'), 'utf8'), 'x')
  assert.ok((await fs.readdir(TMP)).includes('R.md'), '目录项应使用新名字')

  await fs.writeFile(path.join(TMP, 'b.md'), 'b', 'utf8')
  await assert.rejects(() => h.svc.fsRename(path.join(TMP, 'R.md'), 'b.md', 's1'), /同名文件\/文件夹已存在/)
  await assert.rejects(() => h.svc.fsRename(TMP, 'x', 's1'), /当前工作目录/)

  await h.svc.fsCreateFolder(TMP, 'folder-a', 's1')
  await h.svc.fsRename(path.join(TMP, 'folder-a'), 'folder-b', 's1')
  assert.equal((await fs.stat(path.join(TMP, 'folder-b'))).isDirectory(), true)
})

test('delete：版本守卫、目录与越界拒绝、符号链接只删链接', async () => {
  await seed()
  const h = bootHost({ sessions: new Map([['s1', makeSession('s1', TMP)]]) })
  const file = path.join(TMP, 'del.txt')
  await fs.writeFile(file, 'x', 'utf8')
  const info = await h.svc.fsDescribe(file, 's1')
  await h.svc.fsDelete(file, info.version, 's1')
  await assert.rejects(() => fs.stat(file))

  await fs.writeFile(file, 'y', 'utf8')
  const stale = await h.svc.fsDescribe(file, 's1')
  await fs.writeFile(file, 'zz', 'utf8')
  await assert.rejects(() => h.svc.fsDelete(file, stale.version, 's1'), /外部修改/)
  assert.equal(await fs.readFile(file, 'utf8'), 'zz')

  await h.svc.fsCreateFolder(TMP, 'del-dir', 's1')
  await assert.rejects(() => h.svc.fsDelete(path.join(TMP, 'del-dir'), '', 's1'), /只支持删除文件/)

  const target = path.join(here, '.tmp-link-target.txt')
  const link = path.join(TMP, 'link.txt')
  await fs.writeFile(target, 'target', 'utf8')
  try {
    await fs.symlink(target, link, 'file')
    await h.svc.fsDelete(link, '', 's1')
    await assert.rejects(() => fs.stat(link))
    assert.equal(await fs.readFile(target, 'utf8'), 'target')
  } catch (err) {
    if (!err || (err.code !== 'EPERM' && err.code !== 'EACCES')) throw err
  } finally {
    await fs.rm(target, { force: true })
  }
  await assert.rejects(() => h.svc.fsDelete(path.join(here, 'outside.txt'), '', 's1'), /工作区|文件已不存在/)
})

test('deleteFolder：递归删除、根/文件/越界拒绝、符号链接只删链接', async () => {
  await seed()
  const h = bootHost({ sessions: new Map([['s1', makeSession('s1', TMP)]]) })
  const folder = path.join(TMP, 'del-folder')
  await fs.mkdir(path.join(folder, 'nested'), { recursive: true })
  await fs.writeFile(path.join(folder, 'a.txt'), 'a', 'utf8')
  await fs.writeFile(path.join(folder, 'nested', 'b.txt'), 'b', 'utf8')
  const res = await h.svc.fsDeleteFolder(folder, 's1')
  assert.equal(res.name, 'del-folder')
  await assert.rejects(() => fs.stat(folder))

  const file = path.join(TMP, 'not-folder.txt')
  await fs.writeFile(file, 'x', 'utf8')
  await assert.rejects(() => h.svc.fsDeleteFolder(file, 's1'), /只支持删除文件夹/)
  await assert.rejects(() => h.svc.fsDeleteFolder(TMP, 's1'), /当前工作目录/)
  await assert.rejects(() => h.svc.fsDeleteFolder(path.join(here, 'outside-folder'), 's1'), /工作区|已不存在/)

  const targetDir = path.join(here, '.tmp-dir-link-target')
  const link = path.join(TMP, 'dir-link')
  await fs.mkdir(targetDir, { recursive: true })
  try {
    await fs.symlink(targetDir, link, 'junction')
    await h.svc.fsDeleteFolder(link, 's1')
    await assert.rejects(() => fs.stat(link))
    assert.equal((await fs.stat(targetDir)).isDirectory(), true)
  } catch (err) {
    if (!err || (err.code !== 'EPERM' && err.code !== 'EACCES')) throw err
  } finally {
    await fs.rm(targetDir, { recursive: true, force: true })
  }
})

test('会话：新方法按 sessionId 取各自 cwd，未知会话显式报错', async () => {
  const dirA = path.join(here, '.tmp-mut-a')
  const dirB = path.join(here, '.tmp-mut-b')
  await fs.rm(dirA, { recursive: true, force: true })
  await fs.rm(dirB, { recursive: true, force: true })
  await fs.mkdir(dirA, { recursive: true })
  await fs.mkdir(dirB, { recursive: true })
  try {
    const sessions = new Map([
      ['sess-a', makeSession('sess-a', dirA)],
      ['sess-b', makeSession('sess-b', dirB)]
    ])
    const h = bootHost({ sessions })
    await h.svc.fsCreateFile(dirA, 'a.txt', 'sess-a')
    await h.svc.fsCreateFile(dirB, 'b.txt', 'sess-b')
    assert.equal((await h.svc.fsDescribe(path.join(dirA, 'a.txt'), 'sess-a')).relative, 'a.txt')
    assert.equal((await h.svc.fsDescribe(path.join(dirB, 'b.txt'), 'sess-b')).relative, 'b.txt')
    await assert.rejects(() => h.svc.fsCreateFile(dirB, 'x.txt', 'sess-a'), /工作区/)
    await assert.rejects(() => h.svc.fsCreateFile(dirA, 'x.txt', 'nope'), /session not found/)
  } finally {
    await fs.rm(dirA, { recursive: true, force: true })
    await fs.rm(dirB, { recursive: true, force: true })
  }
})

test.after(async () => {
  await fs.rm(TMP, { recursive: true, force: true })
})
