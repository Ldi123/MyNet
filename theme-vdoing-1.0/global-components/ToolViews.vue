<template>
 <div>
   <div  v-if="isfolw==true" class="main-css"> 
     <img :src="flowSrc1" class="img-css" :key="clickCount1"/>
     <img :src="flowSrc2" class="img-css" :key="clickCount2"/>
   </div>
   <div>
    <!-- <button class="niceButton" @click="btnDown">切换下一张</button> -->
   </div>
   <iframe :src="video_url" style="width: 100%;height: 600px;margin-top: 20px;"/>
</div>
</template>
 
<script>
export default {
    data() {
     return {
         video_url:"http://114.55.7.136:6688/play/index.html",
         flowSrc1: null,
         isfolw:true,
         clickCount1:1,
         clickCount2:2
     }
  },
  created() {
    this.fetchImg()
  },
  methods:{
    fetchImg(){
     this.flowSrc1 = "https://api.r10086.com/%E6%A8%B1%E9%81%93%E9%9A%8F%E6%9C%BA%E5%9B%BE%E7%89%87api%E6%8E%A5%E5%8F%A3.php?%E5%9B%BE%E7%89%87%E7%B3%BB%E5%88%97=%E6%9E%81%E5%93%81%E7%BE%8E%E5%A5%B3%E5%9B%BE%E7%89%87";
     this.flowSrc2 = "https://api.r10086.com/%E6%A8%B1%E9%81%93%E9%9A%8F%E6%9C%BA%E5%9B%BE%E7%89%87api%E6%8E%A5%E5%8F%A3.php?%E5%9B%BE%E7%89%87%E7%B3%BB%E5%88%97=%E5%B0%91%E5%A5%B3%E5%86%99%E7%9C%9F1";  
    },
    btnDown(){
     this.clickCount1 +=1
     this.clickCount2 +=1
    }
  },
}
</script>

<style>
 .main-css{
   width: 100%;
   height: 400px;
   overflow: scroll;
   display: grid;
   grid-template-columns: 1fr 1fr;
   grid-column-gap:0.8%;
   justify-items: center;
 }
 .img-css{
  width: 100%;
  height: auto;
 }
 .niceButton{
  position: absolute;
  left: 33%;
  top: 10%;
  margin-top: 3%;
  justify-content: center;
  align-items: center;
  position: relative;
  background-color: rgb(32, 93, 224);
  border: none;
  font-size: 28px;
  color: #ffffff;
  padding: 20px;
  width: 200px;
  text-align: center;
  transition-duration: 0.6s;
  text-decoration: none;
  overflow: hidden;
  cursor: pointer;
}
.niceButton::after{
  content: '';
  background:#53a4f0;
  display: block;
  position: absolute;
  padding-top: 300%;
  padding-left: 350%;
  margin-left: -20px !important;
  margin-top: -120%;
  opacity: 0;
  transition:all 0.8s;
}
.niceButton:active::after{
  padding: 0;
  margin: 0;
  opacity: 1;
  transition: 0s;
}
</style>