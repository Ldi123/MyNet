<template>
  <div class="widget-card lastup-card card-box" v-if="post">
    <div class="widget-card-title">
      <span class="t">🕒 最近更新</span>
    </div>
    <div class="lastup">
      <router-link :to="post.path || '/'">
        <span class="lu-pill" v-if="category">📝 {{ category }}</span>
        <div class="lu-title">{{ title }}</div>
        <div class="lu-meta">
          <span class="ago">{{ ago }}</span>
          <span>· {{ date }}</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
// Safari 无法解析 '2026-09-06 00:00:00' 这类空格分隔格式，回退为斜杠格式
function toDate (d) {
  if (d instanceof Date) return d
  let date = new Date(d)
  if (isNaN(date.getTime()) && typeof d === 'string') {
    date = new Date(d.replace(/-/g, '/'))
  }
  return date
}

export default {
  computed: {
    post () {
      // $sortPostsByDate 是按时间「倒序」（最新的在前面），取第一篇即为最近更新
      const posts = this.$sortPostsByDate || []
      return posts.length ? posts[0] : null
    },
    title () {
      return (this.post && this.post.title) || ''
    },
    category () {
      const fm = (this.post && this.post.frontmatter) || {}
      const c = fm.categories || fm.category
      if (!c) return ''
      return Array.isArray(c) ? c[0] : c
    },
    date () {
      const fm = (this.post && this.post.frontmatter) || {}
      const d = fm.date
      if (!d) return ''
      const date = toDate(d)
      if (isNaN(date.getTime())) return ''
      const pad = n => (n < 10 ? '0' + n : '' + n)
      return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate())
    },
    ago () {
      const fm = (this.post && this.post.frontmatter) || {}
      if (!fm.date) return ''
      const target = toDate(fm.date)
      if (isNaN(target.getTime())) return ''
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const days = Math.round((today.getTime() - target.getTime()) / 86400000)
      if (days <= 0) return '今天更新'
      if (days === 1) return '昨天更新'
      return days + ' 天前更新'
    }
  }
}
</script>