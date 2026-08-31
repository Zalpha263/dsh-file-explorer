// dsh-file-explorer — 渲染管线（v1.9.0）
//
// 纯函数模块：不依赖 ctx / fs，可独立单测。职责：
//   - detectKind：按扩展名/自动检测判定预览类型（markdown | code | text）
//   - renderMarkdown：marked 白名单渲染（raw HTML 转义、链接协议校验、
//     图片占位、标题锚点 + TOC 提取、代码块高亮）
//   - highlightLines：逐行语法高亮 → HTML 行片段数组（行号/虚拟化对齐用），
//     单行超长截断 + 「行过长已省略」标记
//
// 安全约定：产出物只含白名单标签；raw HTML 一律转义为文本；链接仅允许
// http(s) 与页内锚点；图片只渲染占位文本（不加载任何外部资源）。

import { Marked } from 'marked'
import hljs from 'highlight.js'

/** 超过此行数不做语法高亮（hljs 同步处理大文本会卡）。 */
export const MAX_RENDER_LINES = 2000
/** 单行超长阈值：截断 + 省略标记。 */
export const MAX_LINE_CHARS = 2000
/** highlightAuto 置信度阈值（低于视为纯文本，防误判）。 */
const AUTO_DETECT_RELEVANCE = 10

/** HTML 转义（文本 → 安全内联）。 */
export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 扩展名 → hljs 语言。未列入的扩展名走 highlightAuto 兜底。 */
export const EXT_LANG = {
  js: 'javascript', mjs: 'javascript', cjs: 'javascript', jsx: 'javascript',
  ts: 'typescript', mts: 'typescript', cts: 'typescript', tsx: 'typescript',
  json: 'json', jsonc: 'json', html: 'xml', htm: 'xml', xml: 'xml', svg: 'xml',
  css: 'css', scss: 'scss', less: 'less', py: 'python', pyw: 'python',
  java: 'java', kt: 'kotlin', kts: 'kotlin', c: 'c', h: 'c', cc: 'cpp',
  cpp: 'cpp', hpp: 'cpp', cs: 'csharp', go: 'go', rs: 'rust', rb: 'ruby',
  php: 'php', swift: 'swift', lua: 'lua', pl: 'perl', sh: 'bash',
  bash: 'bash', zsh: 'bash', ps1: 'powershell', bat: 'dos', cmd: 'dos',
  sql: 'sql', yaml: 'yaml', yml: 'yaml', toml: 'ini', ini: 'ini',
  dockerfile: 'dockerfile', makefile: 'makefile', diff: 'diff', patch: 'diff',
  gradle: 'gradle', groovy: 'groovy', r: 'r', dart: 'dart',
}

/**
 * 按文件名判定预览类型。sample 用于未知扩展名的自动检测（前若干行）。
 * @returns {{ kind: 'markdown'|'code'|'text', language: string|null }}
 */
export function detectKind(fileName, sample) {
  const dot = String(fileName || '').lastIndexOf('.')
  const ext = dot < 0 ? '' : String(fileName).slice(dot + 1).toLowerCase()
  if (ext === 'md' || ext === 'markdown' || String(fileName) === 'README') {
    return { kind: 'markdown', language: null }
  }
  const language = EXT_LANG[ext]
  if (language) return { kind: 'code', language }
  if (typeof sample === 'string' && sample.trim() !== '') {
    const auto = hljs.highlightAuto(sample.slice(0, 2000))
    if (auto.language && auto.relevance >= AUTO_DETECT_RELEVANCE) {
      return { kind: 'code', language: auto.language }
    }
  }
  return { kind: 'text', language: null }
}

/** 标题 → 锚点 id：空白/特殊字符转连字符，重复标题加序号。 */
function slugify(text, seen) {
  let id = String(text).trim().toLowerCase().replace(/[^\w\u4e00-\u9fa5-]+/g, '-').replace(/^-+|-+$/g, '')
  if (id === '') id = 'section'
  const n = seen.get(id) || 0
  seen.set(id, n + 1)
  return n === 0 ? id : `${id}-${n}`
}

/** marked renderer：白名单产出 + 转义 + 链接校验 + 图片占位 + 标题锚点/TOC。 */
function makeMarkdownRenderer(toc, seen) {
  return {
    // raw HTML 一律转义为文本（不执行）
    html(token) {
      return escapeHtml(token.raw)
    },
    link(token) {
      const href = token.href || '#'
      const safe = /^(https?:|#)/.test(href) ? href : '#'
      const inner = this.parser.parseInline(token.tokens)
      const external = safe.startsWith('http')
      return `<a href="${safe}"${external ? ' target="_blank" rel="noopener"' : ''}>${inner}</a>`
    },
    // 图片占位（本期不做图片渲染；远程/本地均不加载）
    image(token) {
      const label = token.text || token.href || ''
      return `<span class="fexp-md-imgph">[图片: ${escapeHtml(label)}]</span>`
    },
    // 标题：注入锚点 id + 收集 TOC（h1-h3）
    heading(token) {
      const text = token.tokens.map((t) => t.text ?? '').join('').trim()
      const id = slugify(text, seen)
      if (token.depth <= 3 && text !== '') {
        toc.push({ level: token.depth, id, text })
      }
      return `<h${token.depth} id="${id}">${text}</h${token.depth}>`
    },
    // 代码块：按语言高亮（未知语言自动检测）
    code(token) {
      const lang = token.lang && hljs.getLanguage(token.lang) ? token.lang : null
      const html = lang
        ? hljs.highlight(token.text, { language: lang }).value
        : hljs.highlightAuto(token.text).value
      const label = lang ? escapeHtml(lang) : ''
      return `<pre class="fexp-md-code"><code class="hljs" data-lang="${label}">${html}</code></pre>`
    },
  }
}

/**
 * Markdown → 白名单 HTML + 目录。
 * @returns {{ html: string, toc: Array<{level:number,id:string,text:string}> }}
 */
export function renderMarkdown(src) {
  const toc = []
  const seen = new Map()
  const marked = new Marked({
    gfm: true,
    renderer: makeMarkdownRenderer(toc, seen),
  })
  return { html: marked.parse(src), toc }
}

/**
 * 文本窗口读取（纯函数，fsRender 使用）：从字符块序列中取
 * `[offset, offset + limit)` 窗口，供「继续加载」分段续读。
 * @param {string[]} chunks 流式读取收集的字符块
 * @param {number} offset 起始字符偏移（>=0）
 * @param {number} limit 窗口最大字符数
 * @returns {{ text: string, truncated: boolean, offsetChars: number }}
 */
export function windowText(chunks, offset, limit) {
  let text = ''
  let skipped = 0
  for (const chunk of chunks) {
    if (skipped < offset) {
      const take = Math.min(offset - skipped, chunk.length)
      skipped += take
      const rest = chunk.slice(take)
      if (rest !== '') {
        const need = limit - text.length
        if (need <= 0) return { text, truncated: true, offsetChars: offset }
        text += rest.length > need ? rest.slice(0, need) : rest
        if (rest.length > need) return { text, truncated: true, offsetChars: offset }
      }
      continue
    }
    const need = limit - text.length
    if (need <= 0) return { text, truncated: true, offsetChars: offset }
    text += chunk.length > need ? chunk.slice(0, need) : chunk
    if (chunk.length > need) return { text, truncated: true, offsetChars: offset }
  }
  return { text, truncated: false, offsetChars: offset }
}

/**
 * 逐行语法高亮 → HTML 行片段数组（每行一个独立片段，便于行号/虚拟化对齐）。
 * 单行超过 MAX_LINE_CHARS：转义截断 + 省略标记（跳过高亮，防性能问题）。
 * @param {string} text
 * @param {string} language hljs 语言名（detectKind 输出）
 * @returns {string[]}
 */
export function highlightLines(text, language) {
  const lines = String(text).split('\n')
  return lines.map((line) => {
    if (line.length > MAX_LINE_CHARS) {
      return (
        `<span class="fexp-overlong">${escapeHtml(line.slice(0, MAX_LINE_CHARS))}` +
        `<span class="fexp-overlong-mark" title="行过长已省略"> …（行过长已省略）</span></span>`
      )
    }
    try {
      return hljs.highlight(line, { language }).value
    } catch (err) {
      return escapeHtml(line)
    }
  })
}
