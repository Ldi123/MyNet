<template>
  <div class="search-box">
    <input
      ref="input"
      aria-label="Search"
      :value="query"
      :class="{ 'focused': focused }"
      :placeholder="placeholder"
      autocomplete="off"
      spellcheck="false"
      @input="onInput"
      @focus="onFocus"
      @blur="focused = false"
      @keyup.enter="go(focusIndex)"
      @keyup.up="onUp"
      @keyup.down="onDown"
    >
    <ul
      v-if="showSuggestions"
      class="suggestions"
      :class="{ 'align-right': alignRight }"
      @mouseleave="unfocus"
    >
      <li v-if="loading" class="suggestion loading">
        <a href="javascript:;" @click.prevent>
          <span class="page-title">全文检索中…</span>
        </a>
      </li>
      <li
        v-for="(s, i) in suggestions"
        :key="s.path + '#' + i"
        class="suggestion"
        :class="{ focused: i === focusIndex }"
        @mousedown="go(i)"
        @mouseenter="focus(i)"
      >
        <a
          :href="s.path"
          @click.prevent
        >
          <span class="page-title">{{ s.title || s.path }}</span>
          <span
            v-if="s.header"
            class="header"
          >&gt; {{ s.header }}</span>
          <span v-if="s.snippet" class="snippet">{{ s.snippet }}</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import { loadIndex, search } from '@theme/util/fullTextSearch'
import matchQuery from '@theme/util/matchQuery'

/* global SEARCH_MAX_SUGGESTIONS, SEARCH_PATHS, SEARCH_HOTKEYS */
export default {
  name: 'SearchBox',

  data () {
    return {
      query: '',
      focused: false,
      focusIndex: 0,
      placeholder: undefined,
      suggestions: [],
      loading: false,
      ftsFailed: false,
      debounceTimer: null,
      reqId: 0,
      preloading: false
    }
  },

  computed: {
    maxSuggestions () {
      return this.$site.themeConfig.searchMaxSuggestions ||
        (typeof SEARCH_MAX_SUGGESTIONS !== 'undefined' ? SEARCH_MAX_SUGGESTIONS : 10)
    },
    hotkeys () {
      return (typeof SEARCH_HOTKEYS !== 'undefined' && SEARCH_HOTKEYS) || ['s', '/']
    },
    showSuggestions () {
      return this.focused && (this.loading || (this.suggestions && this.suggestions.length))
    },
    alignRight () {
      // 搜索框固定在导航最右侧，下拉必须向左展开，避免溢出视口
      return true
    }
  },

  mounted () {
    this.placeholder = this.$site.themeConfig.searchPlaceholder || ''
    document.addEventListener('keydown', this.onHotkey)
  },

  beforeDestroy () {
    document.removeEventListener('keydown', this.onHotkey)
    if (this.debounceTimer) clearTimeout(this.debounceTimer)
  },

  watch: {
    query () {
      this.onQueryChange()
    }
  },

  methods: {
    onInput (e) {
      this.query = e.target.value
    },

    onFocus () {
      this.focused = true
      this.prefetch()
    },

    // 首次聚焦时后台预取索引，减少第一次搜索的等待
    prefetch () {
      if (this.preloading || this.ftsFailed) return
      this.preloading = true
      loadIndex(this.getBase()).catch(() => { this.ftsFailed = true })
    },

    getBase () {
      return (this.$site && this.$site.base) || '/'
    },

    onQueryChange () {
      if (this.debounceTimer) clearTimeout(this.debounceTimer)
      const q = this.query.trim()
      if (!q) {
        this.suggestions = []
        this.loading = false
        return
      }
      this.loading = true
      this.debounceTimer = setTimeout(() => { this.doSearch(q) }, 120)
    },

    async doSearch (q) {
      const myReq = ++this.reqId
      const keyword = this.keywordSearch(q)

      if (this.ftsFailed) {
        this.suggestions = keyword
        this.loading = false
        return
      }

      try {
        await loadIndex(this.getBase())
        if (myReq !== this.reqId) return // 已被更新的查询取代
        const fts = search(q, this.maxSuggestions)
        this.suggestions = this.merge(fts, keyword)
      } catch (e) {
        this.ftsFailed = true
        this.suggestions = keyword
      } finally {
        if (myReq === this.reqId) {
          this.loading = false
          this.focusIndex = this.suggestions.length ? 0 : -1
        }
      }
    },

    // 全文结果在前，关键词结果补充在后，按 path 去重
    merge (primary, secondary) {
      const out = []
      const seen = {}
      const push = (item) => {
        if (!item || !item.path || seen[item.path]) return
        if (out.length >= this.maxSuggestions) return
        seen[item.path] = true
        out.push(item)
      }
      primary.forEach(push)
      secondary.forEach(push)
      return out
    },

    // 降级：标题 + 标签 + 小标题匹配（原插件逻辑）
    keywordSearch (query) {
      const q = query.toLowerCase()
      const { pages } = this.$site
      const localePath = this.$localePath
      const res = []
      for (let i = 0; i < pages.length; i++) {
        if (res.length >= this.maxSuggestions) break
        const p = pages[i]
        if (this.getPageLocalePath(p) !== localePath) continue
        if (!this.isSearchable(p)) continue

        if (matchQuery(q, p)) {
          res.push({ path: p.path, title: p.title, header: '', snippet: '' })
        } else if (p.headers) {
          for (let j = 0; j < p.headers.length; j++) {
            if (res.length >= this.maxSuggestions) break
            const h = p.headers[j]
            if (h.title && matchQuery(q, p, h.title)) {
              res.push({ path: p.path + '#' + h.slug, title: p.title, header: h.title, snippet: '' })
            }
          }
        }
      }
      return res
    },

    getPageLocalePath (page) {
      for (const localePath in this.$site.locales || {}) {
        if (localePath !== '/' && page.path.indexOf(localePath) === 0) {
          return localePath
        }
      }
      return '/'
    },

    isSearchable (page) {
      let searchPaths = (typeof SEARCH_PATHS !== 'undefined') ? SEARCH_PATHS : null
      if (searchPaths === null) { return true }
      searchPaths = Array.isArray(searchPaths) ? searchPaths : new Array(searchPaths)
      return searchPaths.filter(path => page.path.match(path)).length > 0
    },

    onHotkey (event) {
      if (event.srcElement === document.body && this.hotkeys.includes(event.key)) {
        this.$refs.input.focus()
        event.preventDefault()
      }
    },

    onUp () {
      if (this.showSuggestions && this.suggestions.length) {
        if (this.focusIndex > 0) {
          this.focusIndex--
        } else {
          this.focusIndex = this.suggestions.length - 1
        }
      }
    },

    onDown () {
      if (this.showSuggestions && this.suggestions.length) {
        if (this.focusIndex < this.suggestions.length - 1) {
          this.focusIndex++
        } else {
          this.focusIndex = 0
        }
      }
    },

    go (i) {
      if (!this.showSuggestions || !this.suggestions[i]) {
        return
      }
      this.$router.push(this.suggestions[i].path)
      this.query = ''
      this.suggestions = []
      this.focusIndex = 0
    },

    focus (i) {
      this.focusIndex = i
    },

    unfocus () {
      this.focusIndex = -1
    }
  }
}
</script>

<style lang="stylus">
.search-box
  display inline-block
  position relative
  margin-right 1rem
  input
    cursor text
    width 10rem
    height: 2rem
    color lighten($textColor, 25%)
    display inline-block
    border 1px solid darken($borderColor, 10%)
    border-radius 2rem
    font-size 0.9rem
    line-height 2rem
    padding 0 0.5rem 0 2rem
    outline none
    transition all .2s ease
    background var(--mainBg) url(search.svg) 0.6rem 0.5rem no-repeat
    background-size 1rem
    &:focus
      cursor auto
      border-color var(--festColor, $accentColor)
  .suggestions
    background var(--mainBg)
    width 24rem
    max-width calc(100vw - 2rem)
    max-height 70vh
    overflow-y auto
    position absolute
    top 2rem
    border 1px solid darken($borderColor, 10%)
    border-radius 6px
    padding 0.4rem
    list-style-type none
    box-shadow 0 6px 20px rgba(0,0,0,.15)
    right 0
    left auto
  .suggestion
    line-height 1.4
    padding 0.45rem 0.6rem
    border-radius 4px
    cursor pointer
    &.loading
      opacity 0.6
      cursor default
    a
      display block
      white-space normal
      color lighten($textColor, 35%)
      .page-title
        font-weight 600
      .header
        font-size 0.9em
        margin-left 0.25em
      .snippet
        display block
        margin-top 0.15rem
        font-size 0.82em
        color var(--textColor)
        opacity 0.6
        overflow hidden
        display -webkit-box
        -webkit-line-clamp 2
        -webkit-box-orient vertical
    &.focused
      background-color var(--customBlockBg)
      a
        color var(--festColor, $accentColor)

@media (max-width: $MQNarrow)
  .search-box
    input
      cursor pointer
      width 0
      border-color transparent
      position relative
      &:focus
        cursor text
        left 0
        width 10rem

@media all and (-ms-high-contrast: none)
  .search-box input
    height 2rem

@media (max-width: $MQNarrow) and (min-width: $MQMobile)
  .search-box
    .suggestions
      right 0
      left auto

@media (max-width: $MQMobile)
  .search-box
    margin-right 0
    input
      left 1rem
    .suggestions
      right 0
      left auto

@media (max-width: $MQMobileNarrow)
  .search-box
    .suggestions
      width calc(100vw - 4rem)
    input:focus
      width 8rem
</style>
