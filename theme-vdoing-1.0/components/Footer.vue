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
		本站总访问量 
  <span id="busuanzi_value_site_pv"></span> 次 | 您是本站第 <span id="busuanzi_value_site_uv">
  </span> 位访问者
		</div>


    <!--Vdoing主题遵循MIT协议，完全开源且免费。如果您对主题的修改并不大，希望您保留主题的链接。-->
<!--    Theme by
    <a
      href="https://github.com/xugaoyi/vuepress-theme-vdoing"
      target="_blank"
      title="本站主题"
      >Vdoing</a
    > -->
    <template v-if="footer">
       Copyright © {{ footer.createYear }}-{{ new Date().getFullYear() }}
      <span v-html="footer.copyrightInfo"></span>
    </template>
		<div 
  style="color: #1685a9;font-size:small;font-weight:bolder;">
  网站已正常运行 {{days | formatTime}} 天 {{hours | formatTime}} 时 
  {{minutes | formatTime}} 分 {{seconds | formatTime}} 秒
  </div>
  </div>
</template>

<script>
import moment from 'moment';
let startTime='2021-12-08 00:00:00';
let script_bsz;
export default {
	data() {
		return {
			days:0,
			hours:0,
			minutes:0,
			seconds:0,
		}
	},
	mounted(){
		script_bsz=require("busuanzi.pure.js");
  script_bsz.fetch();
  setInterval(this.getRTime,1000);
	},
 computed: {
   social() {
     return this.$themeConfig.social
   },
   footer() {
     return this.$themeConfig.footer
   },
 },
 methods:{
   getRTime(){
          var NowTime = new Date();
          var t = NowTime - new Date(startTime);
          this.days = Math.floor(t/1000/60/60/24);
          this.hours = Math.floor(t/1000/60/60%24);
          this.minutes = Math.floor(t/1000/60%60);
          this.seconds = Math.floor(t/1000%60);
   }
 },
 filters:{
  // 格式化时间
  formatTime(time) {
      time = time < 10 ? '0' + time : time;
      return time;
  }
 }
	// watch: {
	// 	'$route'(to, from) {
	// 		if(to.path != from.path){
	// 			script_bsz.fetch();
	// 		}
	// 	}
	// },
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
