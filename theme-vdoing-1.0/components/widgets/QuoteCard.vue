<template>
  <div class="widget-card quote-card card-box">
    <div class="widget-card-title">
      <span class="t">💬 今日诗词</span>
    </div>
    <div class="quote">
      <div class="q" :class="{ fade: fading }">
        <img v-if="mode === 'img'" :src="imgUrl" alt="今日诗词" />
        <span v-else>{{ display }}</span>
      </div>
      <div class="src">{{ source }}</div>
      <button class="q-btn" type="button" :disabled="loading" @click="reload">
        {{ loading ? '加载中…' : '换一句 ↻' }}
      </button>
    </div>
  </div>
</template>

<script>
const API = 'https://v2.jinrishici.com/one.json'
const SVG = 'https://v2.jinrishici.com/one.svg?font-size=26&spacing=2&color='
const CACHE_KEY = 'vw-quote-cache'
// 三套主题下的诗词配色
const COLORS = {
  dark: 'E8A87C',
  read: '8F4F22'
}
const DEFAULT_COLOR = 'E8663D'

export default {
  data () {
    return {
      text: '',
      source: '',
      mode: 'text',
      loading: false,
      fading: false,
      lastClick: 0
    }
  },
  computed: {
    display () {
      return this.text ? '「' + this.text + '」' : '加载中…'
    },
    imgUrl () {
      return SVG + this.color()
    },
    color () {
      const el = document.documentElement
      const mode = (el.className || '') + ' ' + (document.body.className || '')
      if (mode.indexOf('theme-mode-dark') > -1) return COLORS.dark
      if (mode.indexOf('theme-mode-read') > -1) return COLORS.read
      return DEFAULT_COLOR
    }
  },
  mounted () {
    this.load(false)
  },
  methods: {
    load (fresh) {
      this.loading = true
      fetch(API, { cache: fresh ? 'reload' : 'default' })
        .then(res => res.json())
        .then(res => {
          const data = res && res.data
          if (!data || !data.content) throw new Error('empty')
          const origin = data.origin || {}
          const source = [origin.dynasty, origin.author, origin.title]
            .filter(Boolean)
            .join(' · ')
          try {
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ c: data.content, s: source })
            )
          } catch (e) {}
          this.mode = 'text'
          this.text = data.content
          this.source = source
          this.fade()
        })
        .catch(() => {
          // 兜底一：上次成功的句子；兜底二：退回 svg 图片（等同原有卡片）
          let cached = null
          try {
            cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
          } catch (e) {}
          if (cached && cached.c) {
            this.mode = 'text'
            this.text = cached.c
            this.source = cached.s || ''
            this.fade()
          } else {
            this.mode = 'img'
            this.text = ''
            this.source = '诗词接口不可用，已回退为图片'
          }
        })
        .then(() => {
          this.loading = false
        })
    },
    fade () {
      this.fading = false
      this.$nextTick(() => {
        this.fading = true
      })
    },
    reload () {
      const now = Date.now()
      if (now - this.lastClick < 3000 || this.loading) return
      this.lastClick = now
      this.load(true)
    }
  }
}
</script>