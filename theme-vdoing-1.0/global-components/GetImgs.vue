<template>
	<div>
		<div v-for="(item,index) in imgs" :key="index">
			<img :src="item.url" />
		</div>
	</div>
</template>

<script>
	import axios from 'axios'
	export default {
		data() {
			return {
				imgs: [],
			}
		},
		created() {
			this.getImgList();
		},
		methods:{
			getImgList(){
						axios.get('/ali/list').then((response) => { // then 成功之后的回调
						this.imgs=	response.data.data
					}).catch(function (error) { //失败时捕获异常
						console.log(error);
					}) 
				},
			
		}
	}
</script>

<style>
</style>
