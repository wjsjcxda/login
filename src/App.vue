<template id="app">
  <div>
		<router-view></router-view>
  </div>
</template>

<script>
	import{mapActions} from 'vuex'
	export default {
		name: 'App',
		mounted() {
			this.getUserInfo()
		},
		methods:{
			...mapActions(['getUserInfo'])
		},
}
</script>

<style lang="stylus" rel='stylesheet/stylus'>
	#app
	  width 100%
	  height 100%
	  background #f5f5f5
</style>