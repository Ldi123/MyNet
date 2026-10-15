<template>
  <div class="announce-bar" v-if="current">
    <span class="ico">{{ current.ico }}</span>
    <span class="txt" title="点击换一条" @click="next">{{ current.text }}</span>
    <a
      v-if="rss"
      class="rss"
      :href="$withBase(rss)"
      title="订阅 RSS"
      target="_blank"
      >📮</a
    >
    <button class="close" title="收起" type="button" @click="closed = true">
      ×
    </button>
  </div>
</template>

<script>
export default {
  data () {
    return {
      idx: 0,
      closed: false
    }
  },
  computed: {
    cfg () {
      return (this.$themeConfig.widgets && this.$themeConfig.widgets.announce) || {}
    },
    list () {
      return Array.isArray(this.cfg.list) ? this.cfg.list : []
    },
    rss () {
      return this.cfg.rss || ''
    },
    current () {
      return this.closed || !this.list.length ? null : this.list[this.idx]
    }
  },
  mounted () {
    if (this.list.length) {
      this.idx = Math.floor(Math.random() * this.list.length)
    }
  },
  methods: {
    next () {
      if (this.list.length) {
        this.idx = (this.idx + 1) % this.list.length
      }
    }
  }
}
</script>