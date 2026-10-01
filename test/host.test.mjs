// dsh-file-explorer — 宿主半区集成测试（真实 cordis Context + 真实文件系统）
//
// v2.0.0 的宿主只剩三件事：fsStat（元数据/版本）、fsRead（文本 + 文本性判定）、
// fsWrite（带乐观并发校验的写回）。本套覆盖：
//   · 服务注册面（旧的文件操作接口必须消失）
//   · 读：文本 + 版本令牌 + 截断标记；二进制与「非 UTF-8」都被识别且拒绝编辑
//   · 写：正常写回、陈旧版本被拒、工作区边界、沙箱拒绝的错误映射
// ctx.fs 用最小桩实现（resolve/stat/processPath/streamText/writeText），
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
  const of = (target) => String(target && target.displayPath !== undefined ? target.displayPath : target)
  const versions = new Map()
  const bump = (file, size) => {
    const next = (versions.get(file) || 0) + 1
    versions.set(file, next)
    return 'ver:' + next + ':' + size
  }
  return {
    resolve: (p) => Promise.resolve({ displayPath: String(p) }),
    stat: async (target) => {
      const file = of(target)
      if (state.hideFile === file) return undefined
      try {
        const st = await fs.stat(file)
        return {
          type: st.isDirectory() ? 'directory' : 'file',
          size: st.size,
          version: 'ver:' + (versions.get(file) || 0) + ':' + st.size
        }
      } catch (err) {
        return undefined
      }
    },
    processPath: (target) => of(target),
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
      if (intent && intent.kind === 'replaceIfVersion') {
        if (!exists) { const err = new Error('gone'); err.code = 'FS_NOT_FOUND'; throw err }
        const current = 'ver:' + (versions.get(file) || 0) + ':' + (await fs.stat(file)).size
        if (current !== intent.version) { const err = new Error('stale'); err.code = 'FS_STALE_VERSION'; throw err }
      }
      await fs.writeFile(file, content, 'utf8')
      const st = await fs.stat(file)
      return { version: bump(file, st.size) }
    }
  }
}

function bootHost(state = {}) {
  const opts = Object.assign({ hideFile: null, notText: null, streamOverride: null, denyWrite: null }, state)
  const ctx = new Context()
  ctx.provide('sandboxPolicy', { workspaceRoot: TMP, resolve: () => ({ mode: 'workspace-write', root: TMP }) })
  ctx.provide('fs', makeFsStub(opts))
  apply(ctx)
  const svc = ctx.get('fileExplorer')
  assert.ok(svc, 'fileExplorer 服务未注册')
  return { ctx, svc, state: opts }
}

async function seed() {
  await fs.rm(TMP, { recursive: true, force: true })
  await fs.mkdir(TMP, { recursive: true })
  await fs.writeFile(path.join(TMP, 'a.md'), '# 标题\n第二行\n', 'utf8')
}

test('启动：只暴露三个方法，旧的文件操作接口全部消失', async () => {
  await seed()
  const { svc } = bootHost()
  assert.equal(typeof svc.fsStat, 'function')
  assert.equal(typeof svc.fsRead, 'function')
  assert.equal(typeof svc.fsWrite, 'function')
  for (const gone of ['fsList', 'fsRender', 'fsCreate', 'fsRename', 'fsCopy', 'fsDelete', 'fsMove', 'wsRoot', 'wsList', 'fsRestore', 'fsSearchName', 'fsGrep', 'fsBatch']) {
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
  const read = await svc.fsRead(file)
  const after = await svc.fsStat(file)
  assert.equal(after.version, read.version, 'stat 与 read 必须给出同一族的版本令牌（陈旧守卫依赖它）')
  await assert.rejects(() => svc.fsStat(path.join(TMP, 'nope.md')), /not found/)
})

test.after(async () => {
  await fs.rm(TMP, { recursive: true, force: true })
})
