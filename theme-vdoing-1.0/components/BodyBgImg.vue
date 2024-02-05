<template>
  <iframe src="http://114.55.7.136:6099/v1/index.html"
  frameborder="0" scrolling="no" 
  class="body-bg"
  v-if="isMobile"
  ></iframe>
  <div
    class="body-bg"
    :style="`background: url(${bgImg}) center center / cover no-repeat;opacity:${opacity}`"
    v-else
  ></div>
</template>

<script>
import { type } from '../util'
export default {
  data () {
    return {
      isMobile:false,
      bgImg: '',
      opacity: 0.5
    }
  },
  mounted () {
    let { bodyBgImg, bodyBgImgOpacity } = this.$themeConfig

    if (type(bodyBgImg) === 'string') {
      this.bgImg = bodyBgImg
    } else if (type(bodyBgImg) === 'array') {
      let count = 0
      let timer = null

      this.bgImg = bodyBgImg[count]
      clearInterval(timer)
      timer = setInterval(() => {
        if (++count >= bodyBgImg.length) {
          count = 0
        }
        this.bgImg = bodyBgImg[count]
      }, 300000);
    }

    if (bodyBgImgOpacity !== undefined) {
      this.opacity = bodyBgImgOpacity
    }
    if (this._isMobile()) {
      this.isMobile = true
    }
  },
  methods:{
   _isMobile() {
          let flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
          return flag;
     }
  }
}
</script>

<style lang='stylus'>
.body-bg
  position fixed
  left 0
  top 0
  z-index -999999
  height 100vh
  width 100vw
  transition background 0.5s
</style>
