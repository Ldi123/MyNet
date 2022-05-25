<template>
  <div class="footer">
    <div class="icons" v-if="social && social.icons">
      <a
        :href="item.link"
        :title="item.title"
        :class="['iconfont', item.iconClass]"
        v-for="(item, index) in social.icons"
        :key="index"
        target="_blank"
      ></a>
    </div>

		<!-- 网站访问量统计 -->
		<div>
		本站总访问量 <span id="busuanzi_value_site_pv"></span> 次 | 您是本站第 <span id="busuanzi_value_site_uv"></span> 位访问者
		</div>


    <!--Vdoing主题遵循MIT协议，完全开源且免费。如果您对主题的修改并不大，希望您保留主题的链接。-->
    Theme by
    <a
      href="https://github.com/xugaoyi/vuepress-theme-vdoing"
      target="_blank"
      title="本站主题"
      >Vdoing</a
    >
    <template v-if="footer">
      | Copyright © {{ footer.createYear }}-{{ new Date().getFullYear() }}
      <span v-html="footer.copyrightInfo"></span>
    </template>
		<div style="color: #1685a9;font-size:large;font-weight:bolder;">截至本次打开，网站已运行{{day}}天{{hours}}时{{minutes}}分{{seconds}}秒</div>
  </div>
</template>

<script>
import moment from 'moment';
let startTime='2021-12-08 00:00:00';
export default {
	data() {
		return {
			day:moment(new Date().getTime()).diff(new Date(startTime).getTime(), 'days'),
			hour:moment(new Date().getTime()).diff(new Date(startTime).getTime(), 'hours'),
			minute:moment(new Date().getTime()).diff(new Date(startTime).getTime(), 'minutes'),
			second:moment(new Date().getTime()).diff(new Date(startTime).getTime(), 'seconds'),
		}
	},
	mounted(){
		script=require("busuanzi.pure.js");
	},
  computed: {
    social() {
      return this.$themeConfig.social
    },
    footer() {
      return this.$themeConfig.footer
    },
		hours(){
			return this.hour-this.day*24
		},
		minutes(){
			return this.minute-this.hour*60
		},
		seconds(){
			return (this.second-this.minute*60)%1000
		}
  },
	watch: {
		'$route'(to, from) {
			if(to.path != from.path){
				script.fetch();
			}
		}
	},
}
</script>

<style lang='stylus'>
// $mobileSidebarWidth = $sidebarWidth * 0.82
.footer
  padding 5rem 1.5rem 2.5rem
  text-align center
  color #666
  box-sizing border-box
  font-size 0.85rem
  transition all 0.2s ease
  > span
    line-height 1.5rem
  .icons
    margin-bottom 12px
    .iconfont
      padding 0 10px
      font-size 1.3rem
  a
    color inherit
    &:hover
      color $accentColor
@media (min-width ($MQMobile + 1px))
  .sidebar-open .footer
    width auto
    padding-left: ($sidebarWidth + 1.5rem)
@media (min-width 1520px)
  .have-rightmenu .footer
    padding-right: ($rightMenuWidth + 1.5rem)
.no-sidebar .footer
  width auto
  padding-left 1.5rem
</style>
