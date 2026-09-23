<template>
  <div class="rec-card" v-if="rec">
    <div class="rec-head">
      <span class="rec-badge">🎲 随机推荐</span>
      <div class="rec-actions">
        <button
          class="rec-shuffle"
          type="button"
          title="换一篇"
          @click="shuffle"
        >
          ↻
        </button>
        <button
          class="rec-close"
          type="button"
          title="关闭"
          @click="$emit('close')"
        >
          ×
        </button>
      </div>
    </div>
    <div class="rec-pills" v-if="recPills.length">
      <span
        class="pill"
        :class="{ warm: index === 1 }"
        v-for="(p, index) in recPills"
        :key="index"
        >{{ p }}</span
      >
    </div>
    <h3 class="rec-title">
      <router-link :to="rec.path">{{ rec.title }}</router-link>
    </h3>
    <p class="rec-excerpt" v-if="recExcerpt">{{ recExcerpt }}</p>
    <div class="rec-foot">
      <span>{{ recDate }}</span>
      <router-link class="rec-more" :to="rec.path">阅读全文 →</router-link>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      rec: null,
      recIndex: -1,
      lastShuffle: 0
    }
  },
  computed: {
    posts () {
      return this.$sortPostsByDate || []
    },
    recPills () {
      if (!this.rec) return []
      const cats = (this.rec.frontmatter.categories || []).filter(Boolean)
      return cats.slice(0, 2)
    },
    recDate () {
      if (!this.rec || !this.rec.frontmatter.date) return ''
      return String(this.rec.frontmatter.date).split(' ')[0]
    },
    recExcerpt () {
      if (!this.rec) return ''
      const raw = this.rec.excerpt || ''
      const text = String(raw).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
      if (text) return text.slice(0, 120)
      const content = String(this.rec.content || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
      return content.slice(0, 120)
    }
  },
  created () {
    this.render(Math.floor(Math.random() * Math.max(this.posts.length, 0)))
  },
  methods: {
    render (i) {
      if (!this.posts.length) {
        this.rec = null
        this.recIndex = -1
        return
      }
      const idx = Math.min(Math.max(i, 0), this.posts.length - 1)
      this.recIndex = idx
      this.rec = this.posts[idx]
    },
    pickOther () {
      const n = this.posts.length
      if (n < 2) return 0
      let i
      do {
        i = Math.floor(Math.random() * n)
      } while (i === this.recIndex)
      return i
    },
    shuffle () {
      const now = Date.now()
      if (now - this.lastShuffle < 300) return
      this.lastShuffle = now
      this.render(this.pickOther())
    }
  }
}
</script>
