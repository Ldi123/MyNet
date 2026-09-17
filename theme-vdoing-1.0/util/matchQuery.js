// 关键词匹配（降级用）：与 @vuepress/plugin-search 的 match-query 行为一致

export default (query, page, additionalStr) => {
  let domain = (page && page.title) || ''

  const tags = page && page.frontmatter && page.frontmatter.tags
  if (tags) {
    domain += ' ' + tags.join(' ')
  }

  if (additionalStr) {
    domain += ' ' + additionalStr
  }

  return matchTest(query, domain)
}

const matchTest = (query, domain) => {
  const escapeRegExp = str => str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')

  // eslint-disable-next-line no-control-regex
  const nonASCIIRegExp = new RegExp('[^\x00-\x7F]')

  const words = query
    .split(/\s+/g)
    .map(str => str.trim())
    .filter(str => !!str)

  if (!nonASCIIRegExp.test(query)) {
    // 纯英文：按词匹配
    const hasTrailingSpace = query.endsWith(' ')
    const searchRegex = new RegExp(
      words
        .map((word, index) => {
          if (words.length === index + 1 && !hasTrailingSpace) {
            return `(?=.*\\b${escapeRegExp(word)})`
          } else {
            return `(?=.*\\b${escapeRegExp(word)}\\b)`
          }
        })
        .join('') + '.+',
      'gi'
    )
    return searchRegex.test(domain)
  } else {
    // 含非 ASCII：子串匹配
    const lower = domain.toLowerCase()
    return words.some(word => lower.indexOf(word.toLowerCase()) > -1)
  }
}
