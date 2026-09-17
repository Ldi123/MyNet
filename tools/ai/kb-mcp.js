#!/usr/bin/env node
/**
 * MyNet 知识库 MCP 服务（stdio 传输，零框架手写 JSON-RPC）
 *
 * 用法：
 *   node kb-mcp.js          # 作为 MCP 服务运行（由 AI 工具拉起）
 *   node kb-mcp.js --check  # 自检：加载文章并跑几条检索，打印到 stderr 后退出
 *
 * 说明：只读取本地 docs/**\/*.md，不联网、无向量、无模型。
 * 注意：stdout 仅用于 JSON-RPC，日志一律走 stderr。
 */
const fs = require('fs')
const path = require('path')
const readline = require('readline')
const matter = require('gray-matter')
const MiniSearch = require('minisearch')

const ROOT = path.resolve(__dirname, '..', '..') // 仓库根目录
const PROTOCOL_VERSION = '2025-06-18'
const SERVER_INFO = { name: 'my-net-kb', version: '1.0.0' }

function log () {
  process.stderr.write('[my-net-kb] ' + Array.prototype.join.call(arguments, ' ') + '\n')
}

// ---------------- 配置 ----------------
function loadConfig () {
  const def = {
    site: '',
    roots: [{ path: 'docs', visibility: 'public' }],
    excludeDirs: ['.vuepress', '@pages', 'node_modules', '.git', '_private'],
    defaultLimit: 8
  }
  const cfgPath = path.join(__dirname, 'kb.config.json')
  if (!fs.existsSync(cfgPath)) return def
  try {
    return Object.assign(def, JSON.parse(fs.readFileSync(cfgPath, 'utf8')))
  } catch (e) {
    log('kb.config.json 解析失败，使用默认配置')
    return def
  }
}

const CONFIG = loadConfig()
const EXCLUDE = {}
;(CONFIG.excludeDirs || []).forEach(function (d) { EXCLUDE[d] = true })

// ---------------- 文档加载 ----------------
function walk (dir, out) {
  let names
  try { names = fs.readdirSync(dir) } catch (e) { return out }
  names.forEach(function (name) {
    if (EXCLUDE[name]) return
    const full = path.join(dir, name)
    let stat
    try { stat = fs.statSync(full) } catch (e) { return }
    if (stat.isDirectory()) walk(full, out)
    else if (path.extname(name).toLowerCase() === '.md') out.push(full)
  })
  return out
}

function parseSection (top) {
  if (top === '_posts') return { order: 100, name: '随笔' }
  const m = top.match(/^(\d+)\.(.+)$/)
  return m ? { order: parseInt(m[1], 10), name: m[2] } : { order: 999, name: top }
}

function formatDate (d) {
  if (!d) return ''
  if (d instanceof Date) {
    const z = function (n) { return String(n).padStart(2, '0') }
    return d.getUTCFullYear() + '-' + z(d.getUTCMonth() + 1) + '-' + z(d.getUTCDate()) + ' ' +
      z(d.getUTCHours()) + ':' + z(d.getUTCMinutes()) + ':' + z(d.getUTCSeconds())
  }
  return String(d)
}

function toPlainText (md) {
  return String(md)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*`_~\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractHeadings (md) {
  const out = []
  const re = /^(#{2,4})\s+(.+)$/gm
  let m
  while ((m = re.exec(md)) !== null) { const t = m[2].trim(); if (t) out.push(t) }
  return out
}

function makeDescription (data, body) {
  if (data.description) return String(data.description).replace(/\s+/g, ' ').trim()
  const lines = body.split('\n')
  let inFence = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.indexOf('```') === 0) { inFence = !inFence; continue }
    if (inFence || !line) continue
    if (/^[#>!<|]/.test(line)) continue
    if (line.indexOf('::') === 0 || line.indexOf('---') === 0) continue
    if (line.indexOf('="') > -1) continue
    const text = toPlainText(line)
    if (text.length < 8 || /[{};]/.test(text)) continue
    return text.slice(0, 160)
  }
  return ''
}

// 分词：CJK bigram + 拉丁/数字按词（与站内检索保持一致）
function tokenize (text) {
  const tokens = []
  const str = String(text || '').toLowerCase()
  const latin = str.match(/[a-z0-9]+/g)
  if (latin) tokens.push.apply(tokens, latin)
  const cjk = str.match(/[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u30ff\uac00-\ud7af]+/g)
  if (cjk) {
    cjk.forEach(function (run) {
      if (run.length === 1) { tokens.push(run); return }
      for (let i = 0; i < run.length - 1; i++) tokens.push(run.slice(i, i + 2))
    })
  }
  return tokens
}

let DOCS = []
let MINI = null

function loadDocs () {
  const docs = []
  CONFIG.roots.forEach(function (root) {
    const base = path.resolve(ROOT, root.path)
    if (!fs.existsSync(base)) { log('root 不存在，已跳过: ' + root.path); return }
    walk(base, []).forEach(function (filePath) {
      const raw = fs.readFileSync(filePath, 'utf8')
      const parsed = matter(raw)
      const data = parsed.data || {}
      const isArticle = !(data.home === true || data.pageComponent || data.article === false)
      if (!isArticle || !data.permalink) return
      const rel = path.relative(ROOT, filePath).split(path.sep).join('/')
      const top = path.relative(base, filePath).split(path.sep)[0]
      const section = parseSection(top)
      const body = parsed.content
      docs.push({
        id: rel,
        rel: rel,
        path: data.permalink,
        url: (CONFIG.site || '') + data.permalink,
        title: data.title || path.basename(filePath, '.md'),
        date: formatDate(data.date),
        categories: Array.isArray(data.categories) ? data.categories.filter(Boolean) : [],
        tags: Array.isArray(data.tags) ? data.tags.filter(Boolean) : [],
        sectionName: section.name,
        sectionOrder: section.order,
        visibility: root.visibility || 'public',
        description: makeDescription(data, body),
        headings: extractHeadings(body),
        text: toPlainText(body),
        body: body
      })
    })
  })

  DOCS = docs
  MINI = new MiniSearch({
    idField: 'id',
    fields: ['title', 'headings', 'tags', 'categories', 'text'],
    storeFields: ['id', 'rel', 'path', 'url', 'title', 'sectionName', 'visibility', 'description'],
    tokenize: tokenize,
    searchOptions: { boost: { title: 4, headings: 2, tags: 2, categories: 1 }, prefix: true, fuzzy: 0.2 }
  })
  MINI.addAll(DOCS.map(function (d) {
    return {
      id: d.id,
      title: d.title,
      headings: d.headings.join(' '),
      tags: d.tags.join(' '),
      categories: d.categories.join(' '),
      text: d.text,
      rel: d.rel,
      path: d.path,
      url: d.url,
      sectionName: d.sectionName,
      visibility: d.visibility,
      description: d.description
    }
  }))
  log('已加载 ' + DOCS.length + ' 篇文章')
}

// ---------------- 工具实现 ----------------
function searchNotes (query, limit) {
  const q = String(query || '').trim()
  if (!q) return []
  const max = limit || CONFIG.defaultLimit
  let raw = MINI.search(q, { combineWith: 'AND' })
  if (!raw.length) raw = MINI.search(q, { combineWith: 'OR' })

  if (raw.length) {
    return raw.slice(0, max).map(function (r) {
      const d = DOCS.find(function (x) { return x.id === r.id })
      return {
        title: r.title,
        url: r.url,
        path: r.path,
        section: r.sectionName,
        visibility: r.visibility,
        header: (d && d.headings.length) ? d.headings[0] : '',
        description: r.description,
        score: Math.round(r.score * 100) / 100
      }
    })
  }

  // 单字兜底：bigram 索引不含单字，用子串线性扫描
  if (q.length === 1) {
    const lower = q.toLowerCase()
    const hits = []
    for (let i = 0; i < DOCS.length && hits.length < max; i++) {
      const d = DOCS[i]
      if (((d.title || '') + ' ' + d.text).toLowerCase().indexOf(lower) > -1) {
        hits.push({
          title: d.title,
          url: d.url,
          path: d.path,
          section: d.sectionName,
          visibility: d.visibility,
          header: d.headings.length ? d.headings[0] : '',
          description: d.description,
          score: 0
        })
      }
    }
    return hits
  }

  return []
}

function getNote (key) {
  const k = String(key || '').trim()
  if (!k) throw new Error('缺少参数 id')
  const lower = k.toLowerCase()
  let d = DOCS.find(function (x) { return x.path === k || x.rel === k || x.id === k })
  if (!d) d = DOCS.find(function (x) { return x.title === k })
  if (!d) d = DOCS.find(function (x) { return x.title.toLowerCase().indexOf(lower) > -1 })
  if (!d) d = DOCS.find(function (x) { return x.rel.toLowerCase().indexOf(lower) > -1 })
  if (!d) throw new Error('未找到文章: ' + k)
  return [
    '# ' + d.title,
    '',
    '> 链接: ' + d.url,
    '> 分类: ' + d.sectionName + ' | 可见性: ' + d.visibility + ' | 日期: ' + d.date,
    '',
    d.body
  ].join('\n')
}

function listNotes (args) {
  args = args || {}
  let list = DOCS.slice()
  if (args.category) list = list.filter(function (d) { return d.categories.indexOf(args.category) > -1 })
  if (args.tag) list = list.filter(function (d) { return d.tags.indexOf(args.tag) > -1 })
  if (args.section) list = list.filter(function (d) { return d.sectionName === args.section })
  list.sort(function (a, b) { return a.date < b.date ? 1 : (a.date > b.date ? -1 : 0) })
  return list.slice(0, args.limit || 100).map(function (d) {
    return { title: d.title, url: d.url, section: d.sectionName, visibility: d.visibility, date: d.date, path: d.path }
  })
}

function countBy (pick) {
  const map = {}
  DOCS.forEach(function (d) {
    pick(d).forEach(function (k) { map[k] = (map[k] || 0) + 1 })
  })
  return Object.keys(map).sort(function (a, b) { return map[b] - map[a] }).map(function (k) {
    return { name: k, count: map[k] }
  })
}

const TOOLS = [
  {
    name: 'search_notes',
    description: '全文检索个人知识库文章，返回最相关的文章列表（标题、链接、分类、命中提示）。支持中文与英文。',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: '检索词或短语' },
        limit: { type: 'number', description: '返回条数，默认 8' }
      },
      required: ['query']
    }
  },
  {
    name: 'get_note',
    description: '按 permalink / 相对路径 / 标题读取某篇文章的完整 Markdown 内容。',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '文章 permalink（如 /pages/xxxxxx/）、相对路径或标题' }
      },
      required: ['id']
    }
  },
  {
    name: 'list_notes',
    description: '列出文章，可按分类(category)、标签(tag)、板块(section)过滤，按日期倒序。',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: '分类名，如 博客 / 随笔' },
        tag: { type: 'string', description: '标签名' },
        section: { type: 'string', description: '板块名，如 博客 / 技术 / 更多 / 收藏夹' },
        limit: { type: 'number', description: '返回条数，默认 100' }
      }
    }
  },
  {
    name: 'list_categories',
    description: '列出全部分类及其文章数量。',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'list_tags',
    description: '列出全部标签及其文章数量。',
    inputSchema: { type: 'object', properties: {} }
  }
]

function callTool (name, args) {
  switch (name) {
    case 'search_notes':
      return JSON.stringify(searchNotes(args.query, args.limit), null, 2)
    case 'get_note':
      return getNote(args.id)
    case 'list_notes':
      return JSON.stringify(listNotes(args), null, 2)
    case 'list_categories':
      return JSON.stringify(countBy(function (d) { return d.categories }), null, 2)
    case 'list_tags':
      return JSON.stringify(countBy(function (d) { return d.tags }), null, 2)
    default:
      throw new Error('未知工具: ' + name)
  }
}

// ---------------- JSON-RPC / MCP ----------------
function send (obj) {
  process.stdout.write(JSON.stringify(obj) + '\n')
}

function reply (id, result) {
  send({ jsonrpc: '2.0', id: id, result: result })
}

function replyError (id, code, message) {
  send({ jsonrpc: '2.0', id: id, error: { code: code, message: message } })
}

function handle (msg) {
  const method = msg.method
  const id = msg.id
  const params = msg.params || {}
  const isNotification = (id === undefined || id === null)

  if (method === 'initialize') {
    return reply(id, {
      protocolVersion: params.protocolVersion || PROTOCOL_VERSION,
      capabilities: { tools: {} },
      serverInfo: SERVER_INFO
    })
  }

  if (isNotification) return // notifications/initialized 等，无需响应

  switch (method) {
    case 'ping':
      return reply(id, {})
    case 'tools/list':
      return reply(id, { tools: TOOLS })
    case 'resources/list':
      return reply(id, { resources: [] })
    case 'prompts/list':
      return reply(id, { prompts: [] })
    case 'tools/call': {
      const name = params.name
      const args = params.arguments || {}
      try {
        const text = callTool(name, args)
        return reply(id, { content: [{ type: 'text', text: text }] })
      } catch (e) {
        return reply(id, { content: [{ type: 'text', text: 'Error: ' + e.message }], isError: true })
      }
    }
    default:
      return replyError(id, -32601, 'Method not found: ' + method)
  }
}

function start () {
  loadDocs()
  const rl = readline.createInterface({ input: process.stdin, terminal: false })
  rl.on('line', function (line) {
    const t = line.trim()
    if (!t) return
    let msg
    try { msg = JSON.parse(t) } catch (e) { return }
    try { handle(msg) } catch (e) { log('handle error: ' + e.message) }
  })
  rl.on('close', function () { process.exit(0) })
}

// ---------------- 自检 ----------------
if (process.argv.indexOf('--check') > -1) {
  loadDocs()
  const samples = ['低位买入', 'gitignore', '动态规划']
  samples.forEach(function (q) {
    const r = searchNotes(q, 3)
    log('query "' + q + '" -> ' + r.length + ' 命中: ' + r.map(function (x) { return x.title }).join(' | '))
  })
  log('categories: ' + countBy(function (d) { return d.categories }).slice(0, 5).map(function (x) { return x.name + '(' + x.count + ')' }).join(', '))
  process.exit(0)
}

start()
