import MiniSearch from 'minisearch'

/**
 * 站内全文检索（基于构建产物 /ai/search-index.json）
 * - 中文按 bigram 分词，英文/数字按词切分
 * - 懒加载：首次搜索时才拉取索引并建立 MiniSearch
 * - 失败静默：由调用方降级为标题/标签匹配
 */

// 分词：CJK 用 bigram，拉丁/数字按词
export function tokenize (text) {
  const tokens = []
  const str = String(text || '').toLowerCase()

  const latin = str.match(/[a-z0-9]+/g)
  if (latin) tokens.push.apply(tokens, latin)

  const cjk = str.match(/[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u30ff\uac00-\ud7af]+/g)
  if (cjk) {
    cjk.forEach(function (run) {
      if (run.length === 1) {
        tokens.push(run)
        return
      }
      for (let i = 0; i < run.length - 1; i++) {
        tokens.push(run.slice(i, i + 2))
      }
    })
  }
  return tokens
}

const cache = {
  status: 'idle', // idle | loading | ready | failed
  mini: null,
  docs: null
}

// 懒加载并建立索引；base 形如 '/MyNet/'
export function loadIndex (base) {
  if (cache.status === 'ready') return Promise.resolve(cache)
  if (cache.status === 'loading') return cache.promise
  if (cache.status === 'failed') return Promise.reject(new Error('search index unavailable'))

  cache.status = 'loading'
  const prefix = base && base.charAt(base.length - 1) === '/' ? base : (base || '/') + '/'
  const url = prefix + 'ai/search-index.json'

  cache.promise = fetch(url)
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status)
      return res.json()
    })
    .then(function (docs) {
      if (!Array.isArray(docs) || !docs.length) throw new Error('empty index')
      const mini = new MiniSearch({
        idField: 'path',
        fields: ['title', 'headings', 'tags', 'categories', 'text'],
        storeFields: ['title', 'url', 'path', 'description', 'headings', 'categories', 'section', 'date'],
        tokenize: tokenize,
        searchOptions: {
          boost: { title: 4, headings: 2, tags: 2, categories: 1 },
          prefix: true,
          fuzzy: 0.2
        }
      })
      mini.addAll(docs)
      cache.mini = mini
      cache.docs = docs
      cache.status = 'ready'
      return cache
    })
    .catch(function (err) {
      cache.status = 'failed'
      throw err
    })

  return cache.promise
}

// 查询，返回 { path, title, header, snippet }
export function search (query, limit) {
  if (cache.status !== 'ready' || !cache.mini) return []
  const q = String(query || '').trim()
  if (!q) return []
  const max = limit || 8

  let raw = cache.mini.search(q, { combineWith: 'AND' })
  if (!raw.length) raw = cache.mini.search(q, { combineWith: 'OR' })

  if (raw.length) {
    return raw.slice(0, max).map(function (r) {
      return {
        path: r.path,
        title: r.title,
        header: (r.headings && r.headings.length) ? r.headings[0] : '',
        snippet: r.description || ''
      }
    })
  }

  // 单字兜底：bigram 索引不含单字，用子串线性扫描
  if (q.length === 1 && cache.docs) {
    const lower = q.toLowerCase()
    const hits = []
    for (let i = 0; i < cache.docs.length && hits.length < max; i++) {
      const d = cache.docs[i]
      const hay = ((d.title || '') + ' ' + (d.text || '')).toLowerCase()
      if (hay.indexOf(lower) > -1) {
        hits.push({ path: d.path, title: d.title, header: '', snippet: d.description || '' })
      }
    }
    return hits
  }

  return []
}
