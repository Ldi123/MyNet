// 节日预设库：每个节日 = 时间窗口 + 视觉 + 节日色
// windows 由农历表(tables.js)自动生成，覆盖 2026-2035，按数组顺序匹配，命中即生效、过期自动下线
// 新增农历节日：在 tables.js 补日期表，然后在这里 lunarWindows(key, 前, 后) 即可
const { LUNAR_FESTIVALS, COVERED_YEARS } = require('./tables')

function pad (n) {
  return n < 10 ? '0' + n : '' + n
}

function fmt (year, month, day) {
  const date = new Date(year, month - 1, day)
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate())
}

// 农历节日：按表逐年生成本年窗口（节前 before 天 ~ 节后 after 天）
function lunarWindows (key, before, after) {
  return COVERED_YEARS.map(year => {
    const md = LUNAR_FESTIVALS[key].dates[year].split('-')
    return [fmt(year, Number(md[0]), Number(md[1]) - before), fmt(year, Number(md[0]), Number(md[1]) + after)]
  })
}

// 公历节日：固定月日，逐年生成本年窗口（自动处理跨月/跨年）
function solarWindows (md, before, after) {
  const parts = md.split('-')
  return COVERED_YEARS.map(year => {
    return [fmt(year, Number(parts[0]), Number(parts[1]) - before), fmt(year, Number(parts[0]), Number(parts[1]) + after)]
  })
}

module.exports = [
  {
    id: 'mid-autumn',
    name: '中秋',
    windows: lunarWindows('midAutumn', 1, 5),
    greeting: '中秋快乐，阖家团圆 🌕',
    corner: { char: '🌕', pos: 'top-right' },
    particles: ['🌕', '🥮'],
    particleCount: { pc: 16, mobile: 8 },
    vars: { color: '#E8A838', bg: 'rgba(232, 168, 56, .15)' },
    dark: 'ok'
  },
  {
    id: 'national',
    name: '国庆',
    windows: solarWindows('10-01', 0, 6),
    greeting: '国庆快乐，山河无恙 🇨🇳',
    corner: { char: '🏮', pos: 'top-right' },
    particles: ['⭐', '🎉'],
    particleCount: { pc: 16, mobile: 8 },
    vars: { color: '#E8534A', bg: 'rgba(232, 83, 74, .12)' },
    dark: 'ok'
  },
  {
    id: 'new-year',
    name: '元旦',
    windows: solarWindows('01-01', 1, 1),
    greeting: '新年快乐 🎉',
    corner: { char: '🎇', pos: 'top-right' },
    particles: ['🎉', '🎊'],
    particleCount: { pc: 18, mobile: 8 },
    vars: { color: '#E8B84A', bg: 'rgba(232, 184, 74, .15)' },
    dark: 'ok'
  },
  {
    id: 'spring-festival',
    name: '春节',
    windows: lunarWindows('spring', 1, 6),
    greeting: '新春大吉，万事如意 🧧',
    corner: { char: '🏮', pos: 'top-right' },
    particles: ['🧧', '❄️'],
    particleCount: { pc: 16, mobile: 8 },
    vars: { color: '#D93A2B', bg: 'rgba(217, 58, 43, .12)' },
    dark: 'ok'
  },
  {
    id: 'dragon-boat',
    name: '端午',
    windows: lunarWindows('dragonBoat', 1, 2),
    greeting: '端午安康，粽叶飘香 🐉',
    corner: { char: '🛶', pos: 'top-right' },
    particles: ['🛶', '🌿'],
    particleCount: { pc: 14, mobile: 7 },
    vars: { color: '#2E9E6B', bg: 'rgba(46, 158, 107, .14)' },
    dark: 'ok'
  }
]
