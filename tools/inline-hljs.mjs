// tools/inline-hljs.mjs — 把 highlight.js（CJS 模块）内联进 lib/client.js。
//
// 背景：客户端模块系统无法解析裸依赖（require("highlight.js") 会抛
// "missed the module table"），/plugins/<id>/ 路由也只服务 client.js。
// 因此把 hljs 的 core + 语言模块以独立作用域 IIFE 的形式内联进
// client.js 的 /*__HLJS_BEGIN__*/ … /*__HLJS_END__*/ 标记区，随 client.js
// 一并由宿主提供服务。
//
// 用法：node tools/inline-hljs.mjs [hljs包根目录]
//   - 缺省读取当前 profile 的 node_modules/highlight.js（与宿主 render.js
//     同版本，保证编辑器与只读视图高亮一致）。
//   - 幂等：重复执行结果一致；hljs 升级后重跑即可。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const CLIENT_PATH = path.join(REPO_ROOT, 'lib', 'client.js')
const BEGIN = '/*__HLJS_BEGIN__*/'
const END = '/*__HLJS_END__*/'

// EXT_LANG 全部目标语言（与 lib/render.js 的扩展名映射一致）+ markdown
//（.md 文件编辑视图也做语法高亮）。
const LANGUAGES = [
  'javascript', 'typescript', 'json', 'xml', 'css', 'scss', 'less',
  'python', 'java', 'kotlin', 'c', 'cpp', 'csharp', 'go', 'rust', 'ruby',
  'php', 'swift', 'lua', 'perl', 'bash', 'powershell', 'dos', 'sql', 'yaml',
  'ini', 'dockerfile', 'makefile', 'diff', 'gradle', 'groovy', 'r', 'dart',
  'markdown',
]

// 依赖先注册：语言工厂在高亮期可能调用 hljs.getLanguage()。
const DEPS = {
  typescript: ['javascript'],
  cpp: ['c'],
  scss: ['css'],
  less: ['css'],
  gradle: ['groovy'],
  groovy: ['java'],
  dockerfile: ['bash'],
}

/** 依赖序：保证 DEPS 中声明的语言先于其消费者注册。 */
function orderedLanguages() {
  const ordered = []
  const placed = new Set()
  const visit = (name, trail) => {
    if (placed.has(name)) return
    if (trail.includes(name)) throw new Error(`inline-hljs: language dependency cycle: ${[...trail, name].join(' -> ')}`)
    for (const dep of DEPS[name] ?? []) visit(dep, [...trail, name])
    ordered.push(name)
    placed.add(name)
  }
  for (const name of LANGUAGES) visit(name, [])
  return ordered
}

function wrapCjs(source) {
  return `(function (module) {\n${source}\n\treturn module.exports;\n})({ exports: {} })`
}

function buildBlock(hljsRoot) {
  const pkg = JSON.parse(fs.readFileSync(path.join(hljsRoot, 'package.json'), 'utf8'))
  const libDir = path.join(hljsRoot, 'lib')
  const coreSrc = fs.readFileSync(path.join(libDir, 'core.js'), 'utf8')
  const langDir = path.join(libDir, 'languages')
  const names = orderedLanguages()
  const langEntries = names.map((name) => {
    const src = fs.readFileSync(path.join(langDir, `${name}.js`), 'utf8')
    return `\t['${name}', ${wrapCjs(src)}],`
  }).join('\n')
  return `${BEGIN}
/* 内联 highlight.js v${pkg.version}（core + ${names.length} 种语言）——
   由 tools/inline-hljs.mjs 生成，勿手改；升级 hljs 后重跑该工具。 */
const hljs = (() => {
\tconst _core = ${wrapCjs(coreSrc)};
\tconst _langs = [
${langEntries}
\t];
\tfor (const [name, factory] of _langs) _core.registerLanguage(name, factory);
\treturn _core;
})();
${END}`
}

const hljsRoot = process.argv[2] || path.join(process.env.USERPROFILE, '.dsh', 'profiles', 'web', 'node_modules', 'highlight.js')
if (!fs.existsSync(path.join(hljsRoot, 'lib', 'core.js'))) {
  console.error(`inline-hljs: highlight.js not found at ${hljsRoot}（可用参数指定包路径）`)
  process.exit(1)
}
const block = buildBlock(hljsRoot)
let client = fs.readFileSync(CLIENT_PATH, 'utf8')
const beginAt = client.indexOf(BEGIN)
const endAt = client.indexOf(END)
if (beginAt === -1 || endAt === -1 || endAt < beginAt) {
  console.error('inline-hljs: client.js 缺少标记区（应存在 /*__HLJS_BEGIN__*/ 与 /*__HLJS_END__*/）')
  process.exit(1)
}
client = client.slice(0, beginAt) + block + client.slice(endAt + END.length)
fs.writeFileSync(CLIENT_PATH, client)
const kb = (Buffer.byteLength(block, 'utf8') / 1024).toFixed(0)
console.log(`inline-hljs: 已内联 hljs v${JSON.parse(fs.readFileSync(path.join(hljsRoot, 'package.json'), 'utf8')).version}（${orderedLanguages().length} 种语言，约 ${kb}KB）到 ${path.relative(REPO_ROOT, CLIENT_PATH)}`)
