<template>
  <div class="widget-card countdown-card card-box" v-if="items.length">
    <div class="widget-card-title">
      <span class="t">⏳ 倒数日</span>
      <span class="extra" v-if="showClock">
        <b>{{ clock }}</b><span>{{ week }}</span>
      </span>
    </div>
    <div class="cd-list">
      <span
        class="cd-item"
        v-for="item in items"
        :key="item.label"
        :class="{ today: item.n === 0 }"
      >
        <span class="lb">{{ item.label }}</span>
        <b class="n">{{ item.n }}<i>天</i></b>
      </span>
    </div>
  </div>
</template>

<script>
import { nextLunarDate } from '@theme/festival/tables'

const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export default {
  data () {
    return {
      items: [],
      clock: '--:--:--',
      week: '',
      day: '',
      timer: null
    }
  },
  computed: {
    cfg () {
      return (this.$themeConfig.widgets && this.$themeConfig.widgets.countdown) || {}
    },
    showClock () {
      return this.cfg.showClock !== false
    },
    max () {
      return this.cfg.max || 4
    }
  },
  created () {
    // 只依赖 Date，SSR 与客户端结果一致，静态产物里也能渲染出胶囊
    this.refresh()
  },
  mounted () {
    this.tick()
    this.timer = setInterval(this.tick, 1000)
  },
  beforeDestroy () {
    if (this.timer) clearInterval(this.timer)
  },
  methods: {
    tick () {
      const now = new Date()
      const pad = n => (n < 10 ? '0' + n : '' + n)
      this.clock = pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds())
      this.week = WEEK[now.getDay()] + ' ' + (now.getMonth() + 1) + '/' + now.getDate()
      // 跨天时重新计算倒计时，避免每秒重排
      const today = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate())
      if (today !== this.day) this.refresh()
    },
    refresh () {
      const now = new Date()
      const pad = n => (n < 10 ? '0' + n : '' + n)
      this.day = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate())
      this.items = this.buildItems()
    },
    // 只算"下一次发生"：MM-DD 与完整日期都已过就顺延到下一年，永不出现负数
    nextDate (dateStr) {
      const parts = String(dateStr).split('-')
      const month = Number(parts[parts.length - 2]) - 1
      const date = Number(parts[parts.length - 1])
      const year = parts.length === 3 ? Number(parts[0]) : new Date().getFullYear()
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      const target = new Date(year, month, date)
      if (target.getTime() < now.getTime()) {
        return new Date(year + 1, month, date)
      }
      return target
    },
    daysTo (target) {
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      return Math.round((target.getTime() - now.getTime()) / 86400000)
    },
    buildItems () {
      const cfg = this.cfg
      const list = []
      const festivals = Array.isArray(cfg.festivals) ? cfg.festivals : []
      festivals.forEach(item => {
        if (!item || !item.label) return
        let target = null
        if (item.lunar) {
          // 农历节日：查表取准确日期（表覆盖 2026-2035）
          target = nextLunarDate(item.lunar)
        } else if (item.date) {
          target = this.nextDate(item.date)
        }
        if (target) {
          list.push({ label: item.label, n: this.daysTo(target) })
        }
      })
      const anniversary = cfg.anniversary
      if (anniversary && anniversary.label && anniversary.date) {
        list.push({
          label: anniversary.label,
          n: this.daysTo(this.nextDate(anniversary.date))
        })
      }
      const toSat = (6 - new Date().getDay() + 7) % 7
      list.push({ label: toSat === 0 ? '周末（今天）' : '距周末', n: toSat })
      list.sort((a, b) => a.n - b.n)
      return list.slice(0, this.max)
    }
  }
}
</script>