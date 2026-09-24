// 节日预设库：每个节日 = 时间窗口 + 视觉 + 节日色
// windows 含首尾，按数组顺序匹配，命中即生效、过期自动下线
// 新增节日照抄一份；农历节日每年只需改 windows
module.exports = [
  {
    id: 'mid-autumn',
    name: '中秋',
    windows: [['2026-09-24', '2026-09-30']],
    greeting: '中秋快乐，阖家团圆 🌕',
    corner: { char: '🌕', pos: 'top-right' },
    particles: ['🌸', '⭐'],
    particleCount: { pc: 16, mobile: 8 },
    vars: { color: '#E8A838', bg: 'rgba(232, 168, 56, .15)' },
    dark: 'ok'
  },
  {
    id: 'national',
    name: '国庆',
    windows: [['2026-10-01', '2026-10-07']],
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
    windows: [['2026-12-31', '2027-01-02']],
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
    windows: [['2027-02-05', '2027-02-12']],
    greeting: '新春大吉，万事如意 🧧',
    corner: { char: '🏮', pos: 'top-right' },
    particles: ['🧧', '❄️'],
    particleCount: { pc: 16, mobile: 8 },
    vars: { color: '#D93A2B', bg: 'rgba(217, 58, 43, .12)' },
    dark: 'ok'
  }
]
