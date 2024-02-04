// nav
module.exports = [
  { text: '首页', link: '/' },
	{
		text:'网站',
		items:[
			{text:'资源库',link:'http://hidi.ys168.com/'},
			{text:'2020旧版网站',link:'https://ldi123.github.io/'},
			{text:'Blog日志',link:'http://114.55.7.136:8080/'},
   {text:'生活博',link:'https://ldi666.github.io/'},
   {text:'热搜榜',link:'http://114.55.7.136:6099/'},
   {text:'✨新年快乐🧨',items:[{text:'烟花',link:'http://114.55.7.136:6099/firework/index.html'}]
   },
		],
	},
  {
    text: '博客',
    link: '/blog/', //目录页链接，此处link是vdoing主题新增的配置项，有二级导航时，可以点击一级导航跳到目录页
    items: [
      // 说明：以下所有link的值只是在相应md文件定义的永久链接（不是什么特殊生成的编码）。另外，注意结尾是有斜杠的
      {
        text: '文章',
        items: [
          { text: 'Java相关', link: '/pages/93f462/' },
          // { text: 'Vue', link: '/pages/5d463fbdb172d43b/' },
        ],
      },
      {
        text: '学习笔记',
        items: [
          { text: 'Vue笔记', link: '/note/vue/' },
        ],
      },
			{
				text: '技术',
				link: '/technology/',
				items: [
					{ text: '技术文档', link: '/pages/ce176b/' },
					{ text: '博客搭建', link: '/pages/075c25/' },
				],
			},
    ],
  },
  {
    text: '更多',
    link: '/more/',
    items: [
	  {text:'常用网站',link:'/pages/2ff955/'},
      { text: '学习', link: '/pages/0ce1f5/' },
      { text: '生活', link: '/pages/e6661d/' },
      { text: '心情', link: '/pages/516fb5/' },
      { text: '实用技巧', link: '/pages/686283/' },
      { text: '友情链接', link: '/pages/2f2b3d/' },
	  { text: '关于', link: '/pages/a35c2a/' },
    ],
  },

  {
    text: '收藏夹',
    link: '/pages/e0b30c/',
    // items: [
    //   { text: '网站', link: '/pages/beb6c0bd8a66cea6/' },
    //   { text: '资源', link: '/pages/eee83a9211a70f9d/' },
    //   { text: 'Vue资源', link: '/pages/12df8ace52d493f6/' },
    // ],
  },
  {
    text: '索引',
    link: '/archives/',
    items: [
      { text: '分类', link: '/categories/' },
      { text: '标签', link: '/tags/' },
      { text: '归档', link: '/archives/' },
    ],
  },
]
