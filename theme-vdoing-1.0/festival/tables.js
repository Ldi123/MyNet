// 农历节日公历日期表（2026-2035）
// 数据经公开资料交叉核对：维基百科「正月初一」、日历网、节日吧、MoonCal(lunar-typescript)
// 说明：农历节日公历日期每年漂移，不能用 MM-DD 顺延，因此一次性预存十年，之后无需再维护。
// 超出表的年份按最后一年同月日顺延（会有数周误差，到时候补一行即可）。
const LUNAR_FESTIVALS = {
  // 春节 · 农历正月初一
  spring: {
    name: '春节',
    dates: {
      2026: '02-17',
      2027: '02-06',
      2028: '01-26',
      2029: '02-13',
      2030: '02-03',
      2031: '01-23',
      2032: '02-11',
      2033: '01-31',
      2034: '02-19',
      2035: '02-08'
    }
  },
  // 端午 · 农历五月初五
  dragonBoat: {
    name: '端午',
    dates: {
      2026: '06-19',
      2027: '06-09',
      2028: '05-28',
      2029: '06-16',
      2030: '06-05',
      2031: '06-24',
      2032: '06-12',
      2033: '06-01',
      2034: '06-20',
      2035: '06-10'
    }
  },
  // 中秋 · 农历八月十五
  midAutumn: {
    name: '中秋',
    dates: {
      2026: '09-25',
      2027: '09-15',
      2028: '10-03',
      2029: '09-22',
      2030: '09-12',
      2031: '10-01',
      2032: '09-19',
      2033: '09-08',
      2034: '09-27',
      2035: '09-16'
    }
  }
}

// 表覆盖的年份区间
const COVERED_YEARS = Object.keys(LUNAR_FESTIVALS.spring.dates).map(Number)

// 取「下一次发生」的公历日期；查不到返回 null
function nextLunarDate(key, from) {
  const item = LUNAR_FESTIVALS[key]
  if (!item) return null
  const base = from ? new Date(from) : new Date()
  base.setHours(0, 0, 0, 0)

  for (let i = 0; i < COVERED_YEARS.length; i++) {
    const year = COVERED_YEARS[i]
    const md = item.dates[year].split('-')
    const date = new Date(year, Number(md[0]) - 1, Number(md[1]))
    if (date.getTime() >= base.getTime()) return date
  }

  // 超出表的年份：按最后一年同月日顺延（农历会漂移，仅作兜底）
  const lastYear = COVERED_YEARS[COVERED_YEARS.length - 1]
  const md = item.dates[lastYear].split('-')
  const month = Number(md[0]) - 1
  const day = Number(md[1])
  let year = base.getFullYear()
  if (new Date(year, month, day).getTime() < base.getTime()) year += 1
  return new Date(year, month, day)
}

module.exports = { LUNAR_FESTIVALS, COVERED_YEARS, nextLunarDate }