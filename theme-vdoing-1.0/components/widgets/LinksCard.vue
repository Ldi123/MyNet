<template>
  <div class="widget-card links-card card-box" v-if="items.length">
    <div class="widget-card-title">
      <span class="t">🔗 友情链接</span>
    </div>
    <div class="links-grid">
      <a
        class="link-item"
        v-for="(item, index) in items"
        :key="index"
        :href="item.u"
        target="_blank"
        rel="noopener"
      >
        <span class="av">{{ item.n.charAt(0) }}</span>
        <span class="meta">
          <span class="n">{{ item.n }}</span>
          <span class="d">{{ item.d }}</span>
        </span>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    items () {
      const widgets = this.$themeConfig.widgets || {}
      const links = widgets.links || {}
      const items = Array.isArray(links.items) ? links.items : []
      return items.filter(item => item && item.n && item.u)
    }
  }
}
</script>