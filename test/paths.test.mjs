// dsh-file-explorer — cross-platform path/name rules (host-only unit tests).
//
// Runs on any host OS: every dialect is exercised explicitly through the
// platform argument, so Windows/macOS/Linux behaviour is pinned even when the
// test machine is Windows.

import test from 'node:test'
import assert from 'node:assert/strict'
import {
  platformName,
  separatorFor,
  caseSensitiveDefault,
  toNativePath,
  relativePath,
  compareKey,
  isInsidePath,
  validateEntryName
} from '../lib/paths.js'

test('platform：三种方言与默认大小写', () => {
  assert.equal(platformName('win32'), 'win32')
  assert.equal(platformName('darwin'), 'darwin')
  assert.equal(platformName('freebsd'), 'linux')
  assert.equal(separatorFor('win32'), '\\')
  assert.equal(separatorFor('linux'), '/')
  assert.equal(caseSensitiveDefault('linux'), true)
  assert.equal(caseSensitiveDefault('win32'), false)
  assert.equal(caseSensitiveDefault('darwin'), false)
})

test('native：Windows 反斜杠与 UNC，POSIX 保留原样', () => {
  assert.equal(toNativePath('D:/work/a b.md', 'win32'), 'D:\\work\\a b.md')
  assert.equal(toNativePath('//server/share/x.txt', 'win32'), '\\\\server\\share\\x.txt')
  assert.equal(toNativePath('/home/a b/c.md', 'linux'), '/home/a b/c.md')
  /* POSIX 的反斜杠是合法文件名字符，不能被改写。 */
  assert.equal(toNativePath('/home/a\\b.md', 'darwin'), '/home/a\\b.md')
})

test('relative：工作区内为 / 相对路径，根为 .，跨盘/越界为 null', () => {
  assert.equal(relativePath('D:\\work', 'D:\\work\\src\\a.md', 'win32'), 'src/a.md')
  assert.equal(relativePath('D:\\work', 'D:\\work', 'win32'), '.')
  assert.equal(relativePath('D:\\work', 'E:\\other\\a.md', 'win32'), null)
  assert.equal(relativePath('/home/me/work', '/home/me/work/src/a.md', 'linux'), 'src/a.md')
  assert.equal(relativePath('/home/me/work', '/home/me/work', 'linux'), '.')
  assert.equal(relativePath('/home/me/work', '/home/me/other/a.md', 'linux'), null)
  assert.equal(relativePath('', '/home/me/a.md', 'linux'), null)
})

test('containment：Windows 大小写不敏感，POSIX 敏感', () => {
  assert.equal(isInsidePath('D:\\Work', 'D:\\work\\src\\a.md', 'win32'), true)
  assert.equal(isInsidePath('/home/me/work', '/home/me/work/src/a.md', 'linux'), true)
  assert.equal(isInsidePath('/home/me/work', '/home/me/Work/src/a.md', 'linux'), false)
  assert.equal(isInsidePath('/home/me/work', '/home/me/workspace/a.md', 'linux'), false)
  assert.notEqual(compareKey('D:\\Work\\A.md', 'win32'), compareKey('D:\\work\\b.md', 'win32'))
  assert.equal(compareKey('D:\\Work\\A.md', 'win32'), compareKey('d:/work/a.md', 'win32'))
})

test('name：Windows 非法字符、保留名、尾随点/空格', () => {
  for (const bad of ['', '  ', '.', '..', 'a/b', 'a\\b', 'a:b', 'a*b', 'a?b', 'a"b', 'a<b', 'a>b', 'a|b', 'a.', 'CON', 'aux.txt', 'COM1', 'lpt9.log', 'a\u0001b']) {
    assert.equal(validateEntryName(bad, 'win32').ok, false, JSON.stringify(bad) + ' 应被拒绝')
  }
  for (const good of ['a.txt', '新建 文件.md', '.env', 'a.b.c', 'concept.md']) {
    assert.equal(validateEntryName(good, 'win32').ok, true, JSON.stringify(good) + ' 应接受')
  }
  assert.equal(validateEntryName('x'.repeat(256), 'win32').ok, false)
  assert.equal(validateEntryName('x'.repeat(255), 'win32').ok, true)
})

test('name：macOS 拒绝冒号，Linux 允许冒号但拒绝反斜杠', () => {
  assert.equal(validateEntryName('a:b', 'darwin').ok, false)
  assert.equal(validateEntryName('a:b', 'linux').ok, true)
  assert.equal(validateEntryName('a\\b', 'darwin').ok, false)
  assert.equal(validateEntryName('a\\b', 'linux').ok, false)
  assert.equal(validateEntryName('a b', 'darwin').ok, true)
  assert.equal(validateEntryName('a\u0000b', 'linux').ok, false)
  /* Linux 上限按 UTF-8 字节：85 个 3 字节汉字 = 255 字节可接受，86 个越界。 */
  assert.equal(validateEntryName('中'.repeat(85), 'linux').ok, true)
  assert.equal(validateEntryName('中'.repeat(86), 'linux').ok, false)
  assert.equal(validateEntryName('开发 文档.md', 'linux').ok, true)
})
