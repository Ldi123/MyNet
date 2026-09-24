const presets = require('./presets')

// 调试预览：填节日 id（如 'mid-autumn'）可无视日期强制启用；上线留空
const FORCE_ID = ''

function pad (n) {
  return n < 10 ? '0' + n : '' + n
}

function formatToday () {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function inWindow (today, win) {
  return today >= win[0] && today <= win[1]
}

// 客户端调用（勿在 SSR 渲染期依赖结果）：命中返回节日对象，否则 null
function getActiveFestival () {
  if (FORCE_ID) {
    const forced = presets.find(p => p.id === FORCE_ID)
    if (forced) return forced
  }
  const today = formatToday()
  for (let i = 0; i < presets.length; i++) {
    const p = presets[i]
    if (p.windows.some(w => inWindow(today, w))) return p
  }
  return null
}

module.exports = { getActiveFestival, presets }
