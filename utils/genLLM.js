/**
 * 生成 AI 友好的静态产物（在 vuepress build 之后运行）：node utils/genLLM.js
 *
 *   dist/llms.txt             站点的 LLM 索引（规范：H1 + blockquote + H2 分组 + 链接）
 *   dist/llms-full.txt        全站正文合并，供 LLM 一次性读取
 *   dist/<permalink>.md       每页纯 markdown（清理 ::: 容器 / HTML 注释）
 *   dist/ai/search-index.json 结构化的文章索引（标题/URL/日期/分类/标签/摘要/正文）
 *
 * 注意：本脚本需兼容 Node 12（CI 构建环境），请勿使用 ?. / ?? / replaceAll / 顶层 await。
 */
const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

const ROOT = path.join(__dirname, '..')
const DOCS_DIR = path.join(ROOT, 'docs')
const DIST_DIR = path.join(DOCS_DIR, '.vuepress', 'dist')
const PUBLIC_AI_DIR = path.join(DOCS_DIR, '.vuepress', 'public', 'ai')
const SITE = 'https://ldi123.tk/MyNet' // 站点绝对地址（含 base '/MyNet/'）

const SITE_TITLE = 'IamDi 知识库'
const SITE_DESC = '简洁、易用的博客系统。个人技术笔记与知识库，涵盖 Java、前端、运维、学习与生活记录。'

// 遍历 docs 下的 md 文件（排除 .vuepress / @pages）
function walk (dir, list) {
  const names = fs.readdirSync(dir)
  names.forEach(name => {
    if (name === '.vuepress' || name === '@pages') return
    const full = path.join(dir, name)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      walk(full, list)
    } else if (path.extname(name).toLowerCase() === '.md') {
      list.push(full)
    }
  })
  return list
}

// 顶级目录名 -> { order, name }：'01.博客' -> { order: 1, name: '博客' }
function parseSection (top) {
  if (top === '_posts') return { order: 100, name: '随笔' }
  const m = top.match(/^(\d+)\.(.+)$/)
  return m ? { order: parseInt(m[1], 10), name: m[2] } : { order: 999, name: top }
}

// 去掉 markdown 语法噪音，得到可读纯文本
function toPlainText (md) {
  return String(md)
    .replace(/```[\s\S]*?```/g, ' ')       // 代码块
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // 图片
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 链接保留文字
    .replace(/[#>*`_~\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// 摘要：frontmatter.description > 正文首段（约100字）
function makeDescription (data, body) {
  if (data.description) return String(data.description).replace(/\s+/g, ' ').trim()
  const lines = body.split('\n')
  let inFence = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.indexOf('```') === 0) { inFence = !inFence; continue } // 代码块开始/结束
    if (inFence) continue
    if (!line) continue
    // 跳过标题/引用/图片/HTML/容器标记/表格/分割线
    if (/^[#>!<|]/.test(line)) continue
    if (line.indexOf('::') === 0 || line.indexOf('---') === 0) continue
    // 跳过 HTML 属性行（style="..." / src="..."）
    if (line.indexOf('="') > -1) continue
    const text = toPlainText(line)
    if (text.length < 8) continue // 太短（单词/标签）不作为摘要
    if (/[{};]/.test(text)) continue // 代码残留
    return text.slice(0, 100)
  }
  return ''
}

// 提取 h2~h4 小标题（用于检索命中提示）
function extractHeadings (md) {
  const out = []
  const re = /^(#{2,4})\s+(.+)$/gm
  let m
  while ((m = re.exec(md)) !== null) {
    const t = m[2].trim()
    if (t) out.push(t)
  }
  return out
}

// 清理正文中 VuePress 专有语法
function cleanMarkdown (md) {
  return String(md)
    .replace(/<!--[\s\S]*?-->/g, '')     // HTML 注释
    .replace(/^:::\s*.*$/gm, '')         // ::: 容器开始/结束标记
    .replace(/\n{3,}/g, '\n\n')          // 折叠多余空行
    .trim()
}

// 日期对象/字符串 -> 'YYYY-MM-DD HH:mm:ss'（用 UTC，和主题 repairDate 保持一致）
function formatDate (d) {
  if (!d) return ''
  if (d instanceof Date) {
    const z = n => String(n).padStart(2, '0')
    return `${d.getUTCFullYear()}-${z(d.getUTCMonth() + 1)}-${z(d.getUTCDate())} ${z(d.getUTCHours())}:${z(d.getUTCMinutes())}:${z(d.getUTCSeconds())}`
  }
  return String(d)
}

// 标题里的 [] 会破坏 markdown 链接
function cleanTitle (title) {
  return String(title).replace(/[\[\]]/g, '').trim()
}

// permalink -> 绝对 URL
function pageUrl (permalink) {
  if (!permalink) return SITE + '/'
  return SITE + permalink
}

// 读取并筛选文章页
function loadPages () {
  const files = walk(DOCS_DIR, [])
  const pages = []

  files.forEach(filePath => {
    const raw = fs.readFileSync(filePath, 'utf8')
    const parsed = matter(raw)
    const data = parsed.data || {}
    const rel = path.relative(DOCS_DIR, filePath).split(path.sep).join('/')
    const top = rel.split('/')[0]
    const section = parseSection(top)
    const body = cleanMarkdown(parsed.content)

    // 过滤：首页 / 目录页(pageComponent) / article:false / 无 permalink
    const isArticle = !(data.home === true || data.pageComponent || data.article === false)
    if (!isArticle || !data.permalink) return

    pages.push({
      title: data.title || cleanTitle(path.basename(filePath, '.md')),
      permalink: data.permalink,
      date: formatDate(data.date),
      categories: Array.isArray(data.categories) ? data.categories.filter(Boolean) : [],
      tags: Array.isArray(data.tags) ? data.tags.filter(Boolean) : [],
      sectionOrder: section.order,
      sectionName: section.name,
      description: makeDescription(data, body),
      headings: extractHeadings(parsed.content),
      body
    })
  })

  pages.sort((a, b) => {
    if (a.sectionOrder !== b.sectionOrder) return a.sectionOrder - b.sectionOrder
    if (a.date !== b.date) return a.date < b.date ? 1 : -1 // 日期降序
    return String(a.title).localeCompare(String(b.title), 'zh')
  })

  return pages
}

// llms.txt：站点索引
function buildLlmsTxt (pages) {
  const groupNames = []
  const groups = {}
  pages.forEach(p => {
    if (!groups[p.sectionName]) { groups[p.sectionName] = []; groupNames.push(p.sectionName) }
    groups[p.sectionName].push(p)
  })

  let out = `# ${SITE_TITLE}\n\n> ${SITE_DESC}\n`
  groupNames.forEach(name => {
    out += `\n## ${name}\n`
    groups[name].forEach(p => {
      const desc = p.description ? `: ${p.description}` : ''
      out += `- [${cleanTitle(p.title)}](${pageUrl(p.permalink)})${desc}\n`
    })
  })
  return out
}

// llms-full.txt：全站正文合并
function buildLlmsFull (pages) {
  let out = `# ${SITE_TITLE}\n\n> ${SITE_DESC}\n> 本文件为全站文章合并文本，供 LLM 一次性读取。\n`
  pages.forEach(p => {
    out += `\n\n---\n\n# ${cleanTitle(p.title)}\n\n> 来源: ${pageUrl(p.permalink)}\n> 日期: ${p.date}\n\n${p.body}\n`
  })
  return out
}

// 为每页写出纯 markdown：/pages/xxxx/ -> dist/pages/xxxx.md
function writePageMarkdown (pages) {
  pages.forEach(p => {
    const rel = String(p.permalink).replace(/^\//, '').replace(/\/$/, '')
    if (!rel) return
    const outFile = path.join(DIST_DIR, rel + '.md')
    fs.mkdirSync(path.dirname(outFile), { recursive: true })
    const content = `# ${cleanTitle(p.title)}\n\n> 来源: ${pageUrl(p.permalink)}\n> 日期: ${p.date}\n\n${p.body}\n`
    fs.writeFileSync(outFile, content)
  })
}

// 结构化索引（供站内全文检索 / MCP 使用）
function buildSearchIndexJson (pages) {
  return JSON.stringify(pages.map(p => ({
    title: p.title,
    url: pageUrl(p.permalink),
    path: p.permalink,
    date: p.date,
    categories: p.categories,
    tags: p.tags,
    section: p.sectionName,
    description: p.description,
    headings: p.headings,
    text: toPlainText(p.body) // 完整正文（纯文本）
  })))
}

function writeSearchIndex (pages) {
  const dir = path.join(DIST_DIR, 'ai')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'search-index.json'), buildSearchIndexJson(pages))
}

function main () {
  const pages = loadPages()

  // 开发模式：只把检索索引写入 public/ai，供 vuepress dev 直接提供
  if (process.argv.indexOf('--dev') > -1) {
    fs.mkdirSync(PUBLIC_AI_DIR, { recursive: true })
    fs.writeFileSync(path.join(PUBLIC_AI_DIR, 'search-index.json'), buildSearchIndexJson(pages))
    console.log(`[genLLM] (dev) 已生成检索索引到 public/ai（${pages.length} 篇）`)
    return
  }

  if (!fs.existsSync(DIST_DIR)) {
    console.error('[genLLM] 未找到 dist 目录，请先运行 vuepress build。')
    process.exit(1)
  }

  fs.writeFileSync(path.join(DIST_DIR, 'llms.txt'), buildLlmsTxt(pages))
  fs.writeFileSync(path.join(DIST_DIR, 'llms-full.txt'), buildLlmsFull(pages))
  writePageMarkdown(pages)
  writeSearchIndex(pages)

  console.log(`[genLLM] 已生成 ${pages.length} 篇文章的 llms.txt / llms-full.txt / 页面 md / ai/search-index.json`)
}

main()
