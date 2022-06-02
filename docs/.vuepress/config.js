const head = require('./config/head.js');
const plugins = require('./config/plugins.js');
const themeConfig = require('./config/themeConfig.js');

module.exports = {
  // theme: 'vdoing', // 使用npm包主题
  theme: require.resolve('../../theme-vdoing-1.0'), // 使用本地主题
		devServer: {
			proxy: {
				'/ali': {
							target: 'http://114.55.7.136:8088',
							changeOrigin: true,
							pathRewrite: {
											'/ali': ''
							}
				},
			},
		},
  title: "IamDi",
  description: '简洁、易用的博客系统',
  base: '/MyNet/', // 格式：'/<仓库名>/'， 默认'/'
  markdown: {
    lineNumbers: true, // 代码行号
  },

  head,
  plugins,
  themeConfig,
}
