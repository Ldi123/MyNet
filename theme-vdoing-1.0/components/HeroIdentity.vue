<template>
  <div class="hero-left">
    <div class="hero-id">
      <img
        class="hero-avatar"
        v-if="blogger && blogger.avatar"
        :src="$withBase(blogger.avatar)"
        :alt="blogger.name"
        @error="$event.target.style.display = 'none'"
      />
        <div class="hero-id-text">
          <div class="hello-row">
            <span class="hello"
              ><span class="dot"></span>{{ helloPrefix }}，我是 {{ bloggerName }}</span
            >
            <span
              class="fest-chip"
              v-if="fest"
              :style="{ color: fest.vars.color, background: fest.vars.bg }"
              >{{ fest.corner.char }} {{ fest.name }}</span
            >
          </div>
          <div class="id-slogan" v-if="blogger && blogger.slogan">
            {{ blogger.slogan }}
          </div>
        </div>
    </div>

    <h1 class="hero-title">
      记录折腾日常，<br />沉淀<em>技术与生活</em>
    </h1>
    <p class="sub">{{ tagline }}</p>

    <div class="stats">
      <div class="stat">
        <b>{{ postCount }}<i>篇</i></b><span>文章</span>
      </div>
      <div class="stat">
        <b>{{ catCount }}<i>个</i></b><span>分类</span>
      </div>
      <div class="stat">
        <b>{{ tagCount }}<i>个</i></b><span>标签</span>
      </div>
      <div class="stat">
        <b>{{ runDays }}<i>天</i></b><span>建站运行</span>
      </div>
    </div>

    <div class="cta">
      <router-link class="btn primary" to="/blog/">浏览博客 →</router-link>
      <router-link class="btn ghost" to="/pages/a35c2a/">关于我</router-link>
      <div
        class="cta-social"
        v-if="social && social.icons && social.icons.length"
      >
        <a
          v-for="(item, index) in social.icons"
          :key="index"
          class="social-btn"
          :href="item.link"
          :title="item.title"
          :class="['iconfont', item.iconClass]"
          target="_blank"
          rel="noopener"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { getActiveFestival } from '@theme/festival'

const SITE_START = new Date('2021-12-08 00:00:00').getTime()

export default {
  props: {
    postCount: { type: Number, default: 0 },
    catCount: { type: Number, default: 0 },
    tagCount: { type: Number, default: 0 },
    tagline: {
      type: String,
      default:
        '一个兼具博客、知识库与文档检索的个人站点。温故而知新，这里是我的多维索引。'
    }
  },
  data () {
    return {
      runDays: 0,
      fest: null,
      helloPrefix: '你好'
    }
  },
  computed: {
    blogger () {
      return this.$themeConfig.blogger || {}
    },
    bloggerName () {
      return this.blogger.name || 'ldi'
    },
    social () {
      return this.$themeConfig.social
    }
  },
  mounted () {
    this.runDays = Math.floor((Date.now() - SITE_START) / 1000 / 60 / 60 / 24)
    this.fest = getActiveFestival()
    this.helloPrefix = this.getTimeGreeting()
  },
  methods: {
    // 按访客本地时间切换问候语
    getTimeGreeting () {
      const h = new Date().getHours()
      if (h >= 5 && h < 9) return '早上好 ☀️'
      if (h >= 9 && h < 12) return '上午好 🌤'
      if (h >= 12 && h < 14) return '中午好 🌞'
      if (h >= 14 && h < 18) return '下午好 🌤'
      if (h >= 18 && h < 23) return '晚上好 🌙'
      return '夜深了 🌃'
    }
  }
}
</script>
