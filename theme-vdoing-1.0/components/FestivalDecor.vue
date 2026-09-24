<template>
  <div
    class="festival-layer"
    v-if="fest"
    :style="festStyle"
    aria-hidden="true"
  >
    <span
      class="festival-corner"
      :class="'pos-' + fest.corner.pos"
      title="点我一下"
      @click="burst"
      >{{ fest.corner.char }}</span
    >
    <span
      class="festival-burst"
      v-for="(p, i) in burstList"
      :key="'b' + i"
      :style="p.style"
      >{{ p.char }}</span
    >
    <template v-if="!isContentPage">
      <span
        class="festival-particle"
        v-for="(p, i) in particles"
        :key="i"
        :style="p.style"
        >{{ p.char }}</span
      >
    </template>
  </div>
</template>

<script>
import { getActiveFestival } from '@theme/festival'

export default {
  data () {
    return {
      fest: null,
      particles: [],
      burstList: []
    }
  },
  computed: {
    // 文章/正文详情页（Page 组件渲染的页面）不飘落，避免干扰阅读
    isContentPage () {
      const fm = (this.$page && this.$page.frontmatter) || {}
      return (
        !fm.home && !fm.categoriesPage && !fm.tagsPage && !fm.archivesPage
      )
    },
    festStyle () {
      if (!this.fest) return {}
      return {
        '--festColor': this.fest.vars.color,
        '--festBg': this.fest.vars.bg
      }
    },
    reducedMotion () {
      return (
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      )
    }
  },
  mounted () {
    this.fest = getActiveFestival()
    if (this.fest) {
      // 节日色挂到 body：装饰层外的组件（如分页）也能用 var(--festColor)
      document.body.style.setProperty('--festColor', this.fest.vars.color)
      document.body.style.setProperty('--festBg', this.fest.vars.bg)
      this.spawnParticles()
    }
  },
  beforeDestroy () {
    if (this._burstTimer) {
      clearTimeout(this._burstTimer)
      this._burstTimer = null
    }
    if (this.fest) {
      document.body.style.removeProperty('--festColor')
      document.body.style.removeProperty('--festBg')
    }
  },
  methods: {
    spawnParticles () {
      const isMobile =
        typeof window !== 'undefined' && window.innerWidth < 720
      const count = isMobile
        ? this.fest.particleCount.mobile
        : this.fest.particleCount.pc
      if (this.reducedMotion) return
      const pool = this.fest.particles
      const list = []
      for (let i = 0; i < count; i++) {
        const left = Math.floor(Math.random() * 96)
        const dur = 9 + Math.floor(Math.random() * 8)
        const delay = -Math.floor(Math.random() * dur)
        const size = 12 + Math.floor(Math.random() * 8)
        list.push({
          char: pool[i % pool.length],
          style: {
            left: left + '%',
            fontSize: size + 'px',
            animationDuration: dur + 's',
            animationDelay: delay + 's'
          }
        })
      }
      this.particles = list
    },
    // 点击角标：迸发一波粒子雨，约 2 秒后消失
    burst () {
      if (!this.fest || this.reducedMotion) return
      if (this._burstTimer) {
        clearTimeout(this._burstTimer)
        this._burstTimer = null
      }
      const isMobile = window.innerWidth < 720
      const n = isMobile ? 10 : 16
      const pool = this.fest.particles.concat([this.fest.corner.char])
      const list = []
      for (let i = 0; i < n; i++) {
        const left = Math.floor(Math.random() * 96)
        const dur = 1.2 + Math.random() * 0.8
        const delay = Math.random() * 0.35
        const size = 14 + Math.floor(Math.random() * 10)
        list.push({
          char: pool[i % pool.length],
          style: {
            left: left + '%',
            fontSize: size + 'px',
            animationDuration: dur + 's',
            animationDelay: delay + 's'
          }
        })
      }
      this.burstList = list
      this._burstTimer = setTimeout(() => {
        this.burstList = []
        this._burstTimer = null
      }, 2400)
    }
  }
}
</script>

<style lang="stylus" scoped>
.festival-layer
  position fixed
  inset 0
  overflow hidden
  pointer-events none
  z-index 11

.festival-corner
  position absolute
  font-size 2.2rem
  line-height 1
  cursor pointer
  pointer-events auto
  filter drop-shadow(0 4px 10px rgba(0, 0, 0, 0.18))
  animation fest-sway 4s ease-in-out infinite
  transition transform 0.15s
  &:hover
    transform scale(1.15)
  &.pos-top-right
    top 4.6rem
    right 1.2rem
  &.pos-top-left
    top 4.6rem
    left 1.2rem
  @media (max-width 719px)
    font-size 1.6rem
    &.pos-top-right
      top 4.2rem
      right 0.7rem
    &.pos-top-left
      top 4.2rem
      left 0.7rem

.festival-particle
  position absolute
  top -2rem
  z-index 1
  opacity 0.75
  user-select none
  will-change transform
  animation-name fest-fall
  animation-timing-function linear
  animation-iteration-count infinite

.festival-burst
  position absolute
  top -2rem
  z-index 2
  opacity 0.95
  user-select none
  pointer-events none
  animation-name fest-fall
  animation-timing-function ease-in
  animation-fill-mode forwards

@keyframes fest-fall
  0%
    transform translateY(0) rotate(0deg)
  100%
    transform translateY(110vh) rotate(360deg)

@keyframes fest-sway
  0%, 100%
    transform translateY(0) rotate(-6deg)
  50%
    transform translateY(6px) rotate(6deg)

@media (prefers-reduced-motion: reduce)
  .festival-corner,
  .festival-particle,
  .festival-burst
    animation none
  .festival-particle,
  .festival-burst
    display none
</style>
