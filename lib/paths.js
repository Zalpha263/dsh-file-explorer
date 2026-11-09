// dsh-file-explorer — cross-platform path and entry-name rules.
//
// Pure functions shared by the host mutation methods and the tests. The
// client keeps a small copy of the name-validation table for inline
// feedback; the host is always authoritative.

import path from 'node:path'

/** Supported path dialects. */
export const PLATFORMS = ['win32', 'darwin', 'linux']

/** Normalise an arbitrary process.platform into one of the supported dialects. */
export function platformName(platform = process.platform) {
  if (platform === 'win32') return 'win32'
  if (platform === 'darwin') return 'darwin'
  return 'linux'
}

/** The node:path implementation for one dialect (deterministic in tests). */
export function pathApi(platform) {
  return platformName(platform) === 'win32' ? path.win32 : path.posix
}

/** Native separator for one dialect. */
export function separatorFor(platform) {
  return platformName(platform) === 'win32' ? '\\' : '/'
}

/** Default case sensitivity: Linux is case-sensitive, Windows/macOS usually not. */
export function caseSensitiveDefault(platform) {
  return platformName(platform) === 'linux'
}

/**
 * Render a host absolute path with the platform's native separators.
 * POSIX paths are left untouched: a backslash is a legal filename character
 * there and must not be rewritten.
 */
export function toNativePath(value, platform = process.platform) {
  const name = platformName(platform)
  if (name === 'win32') {
    const forward = String(value).replace(/\//g, '\\')
    return path.win32.normalize(forward)
  }
  return String(value)
}

/**
 * Workspace-relative path using forward slashes, or null when the target is
 * outside the root. The root itself is '.'.
 */
export function relativePath(root, target, platform = process.platform) {
  if (typeof root !== 'string' || root.trim() === '') return null
  if (typeof target !== 'string' || target.trim() === '') return null
  const api = pathApi(platform)
  const rel = api.relative(root, target)
  if (rel === '') return '.'
  if (rel === '..' || rel.startsWith('..' + api.sep) || api.isAbsolute(rel)) return null
  return platformName(platform) === 'win32' ? rel.replace(/\\/g, '/') : rel
}

/** Canonical comparison key; Windows folds case, macOS/Linux stay exact. */
export function compareKey(value, platform = process.platform) {
  const api = pathApi(platform)
  const native = platformName(platform) === 'win32' ? String(value).replace(/\//g, '\\') : String(value)
  const resolved = api.resolve(native)
  return platformName(platform) === 'win32' ? resolved.toLowerCase() : resolved
}

/** Whether child is the same as, or lexically inside, parent. */
export function isInsidePath(parent, child, platform = process.platform) {
  if (typeof parent !== 'string' || parent === '') return false
  if (typeof child !== 'string' || child === '') return false
  const api = pathApi(platform)
  const root = compareKey(parent, platform)
  const target = compareKey(child, platform)
  if (root === target) return true
  const sep = api.sep
  return target.startsWith(root + sep)
}

/**
 * Validate one entry name (not a path) for the host platform.
 * @returns {{ ok: true, name: string } | { ok: false, message: string }}
 */
export function validateEntryName(name, platform = process.platform) {
  const dialect = platformName(platform)
  if (typeof name !== 'string') return { ok: false, message: '文件名必须是字符串' }
  const trimmed = name.trim()
  if (trimmed === '') return { ok: false, message: '文件名不能为空' }
  if (trimmed === '.' || trimmed === '..') return { ok: false, message: '文件名不能是 . 或 ..' }
  if (/[\\/]/.test(trimmed)) return { ok: false, message: '文件名不能包含路径分隔符' }
  if (/[\u0000-\u001f\u007f]/.test(trimmed)) return { ok: false, message: '文件名不能包含控制字符' }

  if (dialect === 'win32') {
    if (/[<>:"|?*]/.test(trimmed)) return { ok: false, message: '文件名包含 Windows 不允许的字符：< > : " | ? *' }
    if (/[ .]$/.test(trimmed)) return { ok: false, message: '文件名不能以空格或点结尾' }
    const base = trimmed.split('.')[0]
    if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(base)) {
      return { ok: false, message: '文件名是 Windows 保留设备名：' + base }
    }
    if (trimmed.length > 255) return { ok: false, message: '文件名超过 255 个字符' }
  } else if (dialect === 'darwin') {
    if (trimmed.includes(':')) return { ok: false, message: 'macOS 文件名不能包含冒号' }
    if (trimmed.length > 255) return { ok: false, message: '文件名超过 255 个字符' }
  } else {
    if (Buffer.byteLength(trimmed, 'utf8') > 255) return { ok: false, message: '文件名超过 255 字节' }
  }

  return { ok: true, name: trimmed }
}
