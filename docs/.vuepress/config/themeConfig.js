const nav = require('./nav.js');
const htmlModules = require('./htmlModules.js');
// const sidebar = require('./sidebar.js');

// 主题配置
module.exports = {
  nav,
  sidebarDepth: 2, // 侧边栏显示深度，默认1，最大2（显示到h3标题）
  logo: '/img/my-logo.png', // 导航栏logo
  // repo: 'ldi123/MyNet', // 导航栏右侧生成Github链接
  searchMaxSuggestions: 10, // 搜索结果显示最大数
  lastUpdated: '上次更新', // 开启更新时间，并配置前缀文字   string | boolean (取值为git提交时间)
  // docsDir: 'docs', // 编辑的文件夹
  // editLinks: true, // 启用编辑
  // editLinkText: '编辑',
  //*** 以下配置是Vdoing主题改动和新增的配置 ***//

  // category: false, // 是否打开分类功能，默认true。 如打开，会做的事情有：1. 自动生成的frontmatter包含分类字段 2.页面中显示与分类相关的信息和模块 3.自动生成分类页面（在@pages文件夹）。如关闭，则反之。
  // tag: false, // 是否打开标签功能，默认true。 如打开，会做的事情有：1. 自动生成的frontmatter包含标签字段 2.页面中显示与标签相关的信息和模块 3.自动生成标签页面（在@pages文件夹）。如关闭，则反之。
  // archive: false, // 是否打开归档功能，默认true。 如打开，会做的事情有：1.自动生成归档页面（在@pages文件夹）。如关闭，则反之。
  // categoryText: '随笔', // 碎片化文章（_posts文件夹的文章）预设生成的分类值，默认'随笔'

  bodyBgImg: [
		// 原外链图床已不可用（photo.sibnet.ru 403），改为本地自托管（public/img）
		'/img/bg1.jpg',
    '/img/bg2.jpg'
  ], // body背景大图，默认无。 单张图片 String || 多张图片 Array, 多张图片时每隔15秒换一张。
  // bodyBgImgOpacity: 0.5, // body背景图透明度，选值 0 ~ 1.0, 默认0.5

  // titleBadge: false, // 文章标题前的图标是否显示，默认true
  // titleBadgeIcons: [ // 文章标题前图标的地址，默认主题内置图标
  //   '图标地址1',
  //   '图标地址2'
  // ],
  // contentBgStyle: 1, // 文章内容块的背景风格，默认无. 1 => 方格 | 2 => 横线 | 3 => 竖线 | 4 => 左斜线 | 5 => 右斜线 | 6 => 点状

  // updateBar: { // 最近更新栏
  //   showToArticle: true, // 显示到文章页底部，默认true
  //   moreArticle: '/archives' // “更多文章”跳转的页面，默认'/archives'
  // },
  rightMenuBar: false, // 是否显示右侧文章大纲栏，默认true (屏宽小于1300px下无论如何都不显示)
  sidebarOpen: false, // 初始状态是否打开侧边栏，默认true
  // pageButton: false, // 是否显示快捷翻页按钮，默认true

  sidebar: 'structuring', // 侧边栏  'structuring' | { mode: 'structuring', collapsable: Boolean} | 'auto' | 自定义    温馨提示：目录页数据依赖于结构化的侧边栏数据，如果你不设置为'structuring',将无法使用目录页

  homeRec: true, // 首页随机推荐卡，false 关闭；也可在 index.md frontmatter 用 recCard: false 单页关闭

  widgets: {
    // ===== 首页挂件（可拔插）=====
    // 每个挂件独立互不影响：设为 false 即从首页移除，组件文件也可随时删
    announce: {
      // 公告条：随机展示一条，点文字换下一条，× 收起
      rss: '', // RSS 地址，留空则不显示订阅按钮
      list: [
        { ico: '📢', text: '首页焕新上线，挂件可自由拔插，不喜欢的直接关掉' },
        { ico: '🎉', text: '本站已稳定运行多年，感谢每一个路过的你' },
        { ico: '☕', text: '夜间刷文记得切换右上角「阅读」模式护眼' }
      ]
    },
    countdown: {
      // 倒数日：只放"每年循环"的条目，已过的自动顺延到下一年，永不出现负数
      max: 4, // 卡片宽度有限，只渲染最近的 N 个
      showClock: true, // 标题右侧显示本地时钟
      festivals: [
        { label: '元旦', date: '01-01' }, // 公历节日：写 MM-DD 即可
        { label: '国庆', date: '10-01' },
        // 农历节日：用 lunar 指定表里的 key，日期自动查表（覆盖 2026-2035）
        { label: '春节', lunar: 'spring' },
        { label: '端午', lunar: 'dragonBoat' },
        { label: '中秋', lunar: 'midAutumn' }
      ],
      anniversary: { label: '本站周年', date: '12-08' } // 也支持 MM-DD，自动顺延
    },
    lastUpdate: true, // 最近更新：零配置，自动取最新一篇文章
    links: {
      // 友情链接
      items: [
        { n: 'Vdoing', d: '主题主页', u: 'https://xugaoyi.github.io/vuepress-theme-vdoing/' },
        { n: 'VuePress', d: '文档站', u: 'https://v1.vuepress.vuejs.org/zh/' },
        { n: 'MDN', d: 'Web 文档', u: 'https://developer.mozilla.org/zh-CN/' },
        { n: 'Can I use', d: '兼容性', u: 'https://caniuse.com/' }
      ]
    },
    quote: true // 今日诗词：jinrishici 接口 + 本地缓存兜底 + svg 图片兜底
  },

  author: {
    // 文章默认的作者信息，可在md文件中单独配置此信息 String | {name: String, link: String}
    name: 'di', // 必需
    link: 'http://ldi123.tk', // 可选的
  },
  blogger: {
    // 博主信息，显示在首页侧边栏
    avatar: '/img/info.png', // 原 photo.sibnet.ru 头像已 403，回退为站内图（曾用头像）
    name: 'ldi',
    slogan: '喜欢折腾！',
  },
  social: {
    // 社交图标，显示于博主信息栏和页脚栏
    // iconfontCssFile: '//at.alicdn.com/t/font_1678482_u4nrnp8xp6g.css', // 可选，阿里图标库在线css文件地址，对于主题没有的图标可自由添加
    icons: [
      {
        iconClass: 'icon-youjian',
        title: '发邮件',
        link: 'mailto:2694494031@qq.com',
      },
      {
        iconClass: 'icon-github',
        title: 'GitHub',
        link: 'https://github.com/ldi123',
      },
      // {
      //   iconClass: 'icon-erji',
      //   title: '听音乐',
      //   link: 'https://music.163.com/#/playlist?id=755597173',
      // },
    ],
  },
  footer: {
    // 页脚信息
    createYear: 2021, // 博客创建年份
    copyrightInfo:
      // 'Di | <a href="https://github.com/xugaoyi/vuepress-theme-vdoing/blob/master/LICENSE" target="_blank">MIT License</a>', // 博客版权信息，支持a标签
	  'Di'
  },
  htmlModules // 插入hmtl(广告)模块
}
