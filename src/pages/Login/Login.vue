<template>
	<section class="loginContainer">
			<div class="loginInner">
				<canvas id="canvas" style="position:absolute;bottom:0px;left:0px;z-index: -1;"></canvas>  
				<div class="login_header">
					<h2 class="login_logo">启明星外卖</h2>
					<div class="login_header_title">
						<a href="javascript:;" :class="{on:loginWay}" @click="loginWay=true">短信登录</a>
						<a href="javascript:;" :class="{on:!loginWay}" @click="loginWay=false">密码登录</a>
					</div>
				</div>
				<div class="login_content">
					<form @submit.prevent="login">
						<div :class="{on:loginWay}">
							<section class="login_message">
								<input type="tel" maxlength="11" placeholder="手机号" v-model="phone">
								<button :disabled="!rightPhone" class="get_verification" 
										:class="{right_phone:rightPhone}" @click.prevent="getCode">{{computeTime ? `已发送(${computeTime}s)`: '获取验证码'}}</button>
							</section>
							<section class="login_verification">
								<input type="tel" maxlength="8" placeholder="验证码" v-model="code">
							</section>
							<section class="login_hint">
								温馨提示：未注册启明星外卖帐号的手机号，登录时将自动注册，且代表已同意
								<a href="javascript:;">《用户服务协议》</a>
							</section>
						</div>
						<div :class="{on:!loginWay}">
							<section>
								<section class="login_message">
									<input type="tel" maxlength="11" placeholder="用户名" v-model="name">
								</section>
								<section class="login_verification">
									<input :type="showPwd ? 'text' : 'password'" maxlength="8" placeholder="密码" v-model="pwd">
									<div class="switch_button" :class="showPwd ? 'on' : 'off'" @click="showPwd=!showPwd">
										<div class="switch_circle" :class="{right:showPwd}"></div>
										<span class="switch_text">{{showPwd ? 'abc' : '...'}}</span>
									</div>
								</section>
								<section class="login_message">
									<input type="text" maxlength="11" placeholder="验证码" v-model="captcha">
									<img class="get_verification" src="http://localhost:4000/captcha" alt="captcha" @click="getCaptcha" ref="captcha">
								</section>
							</section>
						</div>
						<button class="login_submit">登录</button>
					</form>
					<a href="javascript:;" class="about_us">关于我们</a>
				</div>
			</div>
		<AlertTip :alertText="alertText" v-show="alertShow" @closeTip='closeTip'></AlertTip>
	</section>
</template>

<script>
	import {reqPwdLogin,reqCode,reqPhoneLogin} from '../../api/index.js'
	import AlertTip from '../../components/AlertTip/AlertTip.vue'
	export default {
		name:'Login',
		mounted() {
			var canvas = document.getElementById('canvas');
			var ctx = canvas.getContext('2d');
			canvas.width = window.innerWidth;
			canvas.height = (window.innerHeight/4)*2;
			
			//如果浏览器支持requestAnimFrame则使用requestAnimFrame否则使用setTimeout
			window.requestAnimFrame = (function(){
			return  window.requestAnimationFrame       ||
					window.webkitRequestAnimationFrame ||
					window.mozRequestAnimationFrame    ||
					function( callback ){
					  window.setTimeout(callback, 1000 / 120);
					};
			})();
			
			//定义三条不同波浪的颜色
			var lines = ["rgba(0,222,255, 0.2)",
			               "rgba(157,192,249, 0.2)",
			               "rgba(0,168,255, 0.2)"];
			
			//初始角度为0
			var step = 0;
			function loop(){
				//清空canvas
				ctx.clearRect(0,0,canvas.width,canvas.height);	
				//角度增加一度
				step++;
				//画3个不同颜色的矩形
				for(var j = lines.length - 1; j >= 0; j--) {
				//填充颜色
				ctx.fillStyle = lines[j];
				//角度转换成弧度,每个矩形的角度都不同，每个之间相差45度
				var angle = (step+j*45)*Math.PI/180;
				//矩形高度的变化量
				var deltaHeight   = Math.sin(angle) * 50;
				//矩形高度的变化量(右上顶点)
				var deltaHeightRight   = Math.cos(angle) * 50;
				//开始绘制路径
				ctx.beginPath();
				//左上角
				ctx.moveTo(0,canvas.height/2+deltaHeight);
				//右上角
				//画曲线
				ctx.bezierCurveTo(canvas.width /2, canvas.height/2+deltaHeight-50, canvas.width / 2, canvas.height/2+deltaHeightRight-50, canvas.width, canvas.height/2+deltaHeightRight);
				//右下角
				ctx.lineTo(canvas.width, canvas.height);
				//左下角
				ctx.lineTo(0, canvas.height);
				//左上角
				ctx.lineTo(0, canvas.height/2+deltaHeight);
				//闭合路径
				ctx.closePath();
				//填充路径
				ctx.fill();
				}
				requestAnimFrame(loop);
			}
			loop();
		},
		data(){
			return {
				loginWay:false, //true代表短信登录,false代表密码登录
				computeTime:0, //计时的时间
				showPwd:false, //是否显示密码
				phone:'', //手机号
				code:'', //短信验证码
				name:'', //用户名
				pwd:'', //密码
				captcha:'',//图形验证码
				alertText:'',//提示文本
				alertShow:false,//是否显示警示框
			}
		},
		components:{AlertTip},
		computed:{
			rightPhone (){
				return /^1\d{10}$/.test(this.phone)
			}
		},
		methods:{
			//异步获取短信验证码
			async getCode(){
				//如果当前没有计时
				if(!this.computeTime){
					//启动倒计时
					this.computeTime = 30
					this.timer = setInterval(()=>{
						this.computeTime--
						if(this.computeTime<=0){
							//停止计时
							clearInterval(this.timer)
						}
					},1000)
					
					//发送ajax请求(向指定手机号发送验证码短信)
					result = await reqCode(this.phone)
					if(result.code===1){
						//显示提示
						this.showAlert(result.msg)
						//停止倒计时
						if(this.computeTime) {
							this.computeTime = 0
							clearInterval(this.timer)
							this.timer = undefined
						}
					}
				}
				
			},
			//展示警告框
			showAlert(alertText){
				this.alertShow = true
				this.alertText = alertText
			},
			//异步登录
			async login(){
				let result
				//前台表单验证
				if(this.loginWay){ //短信登录
					const {rightPhone,phone,code} = this
					if(!this.rightPhone){
						//手机号不正确
						this.showAlert('手机号不正确')
						return
					}else if(!/^\d{6}$/.test(code)){
						//验证码必须是六位数字
						this.showAlert('验证码必须是六位数字')
						return
					}
					//发送ajax请求短信登录
					result = await reqPhoneLogin(phone,code)
				}else {// 密码登录
					const {name,pwd,captcha} = this
					if(!this.name){
						//用户名不能为空
						this.showAlert('用户名不能为空')
						return
					}else if(!this.pwd){
						//密码不能为空
						this.showAlert('密码不能为空')
						return
					}else if(!this.captcha){
						//验证码不能为空
						this.showAlert('验证码不能为空')
						return
					}else if(this.name != 'admin' && !((/^[A-z]*$/).test(this.name))){
						//验证码不能为空
						this.showAlert('用户名只能含有字母')
						return
					}else if(this.name != 'admin' && (/^[A-z]*$/).test(this.name) &&(this.pwd.length < 6)){
						//验证码不能为空
						this.showAlert('密码不能小于六位')
						return
					}
					// 发送ajax请求密码登录
					result = await reqPwdLogin({name,pwd,captcha})	
				}
				
				//停止倒计时
				if(this.computeTime) {
					this.computeTime = 0
					clearInterval(this.timer)
					this.timer = undefined
				}
				
				//根据结果数据处理
				if(result.code===0 && result.data.name === 'admin'){
					const user = result.data
					//将user保存到vuex的state中取		
					this.$store.dispatch('saveUser',user)
					//跳转去个人中心页面
					this.$router.replace('./manger')
				}else if(result.code===0){
					const user = result.data
					console.log(user)
					//将user保存到vuex的state中取		
					this.$store.dispatch('saveUser',user)
					//跳转去个人中心页面
					this.$router.replace('./profile')
				}else{
					//显示新的图片验证码
					this.getCaptcha()
					const msg = result.msg
					this.showAlert(msg)
				}
			},
			//关闭警告框
			closeTip(){
				this.alertShow = false
				this.alertText = ''
			},
			//获取一个新的图片验证码
			getCaptcha(){
				this.$refs.captcha.src='http://localhost:4000/captcha?time='+Date.now()
			}
		}
	}
</script>

<style lang="stylus" rel='stylesheet/stylus'>
	@import '../../common/stylus/mixins'
	.loginContainer
	  width 100%
	  height 100%
	  background #fff
	  .loginInner
	    padding-top 60px
	    width 80%
	    margin 0 auto
	    .login_header
	      .login_logo
	        font-size 40px
	        font-weight bold
	        color #02a774
	        text-align center
	      .login_header_title
	        padding-top 40px
	        text-align center
	        >a
	          color #333
	          font-size 14px
	          padding-bottom 4px
	          &:first-child
	            margin-right 40px
	          &.on
	            color #02a774
	            font-weight 700
	            border-bottom 2px solid #02a774
	    .login_content
	      >form
	        >div
	          display none
	          &.on
	            display block
	          input
	            width 100%
	            height 100%
	            padding-left 10px
	            box-sizing border-box
	            border 1px solid #ddd
	            border-radius 4px
	            outline 0
	            font 400 14px Arial
	            &:focus
	              border 1px solid #02a774
	          .login_message
	            position relative
	            margin-top 16px
	            height 48px
	            font-size 14px
	            background #fff
	            .get_verification
	              position absolute
	              top 50%
	              right 10px
	              transform translateY(-50%)
	              border 0
	              color #ccc
	              font-size 14px
	              background transparent 
	              &.right_phone
	                color black
	          .login_verification
	            position relative
	            margin-top 16px
	            height 48px
	            font-size 14px
	            background #fff
	            .switch_button
	              font-size 12px
	              border 1px solid #ddd
	              border-radius 8px
	              transition background-color .3s,border-color .3s
	              padding 0 6px
	              width 30px
	              height 16px
	              line-height 16px
	              color #fff
	              position absolute
	              top 50%
	              right 10px
	              transform translateY(-50%)
	              &.off
	                background #fff
	                .switch_text
	                  float right
	                  color #ddd
	              &.on
	                background #02a774
	              >.switch_circle
	                //transform translateX(27px)
	                position absolute
	                top -1px
	                left -1px
	                width 16px
	                height 16px
	                border 1px solid #ddd
	                border-radius 50%
	                background #fff
	                box-shadow 0 2px 4px 0 rgba(0,0,0,.1)
	                transition transform .3s
	                &.right
	                  transform translateX(27px)
	          .login_hint
	            margin-top 12px
	            color #999
	            font-size 14px
	            line-height 20px
	            >a
	              color #02a774
	        .login_submit
	          display block
	          width 100%
	          height 42px
	          margin-top 30px
	          border-radius 4px
	          background #4cd96f
	          color #fff
	          text-align center
	          font-size 16px
	          line-height 42px
	          border 0
	      .about_us
	        display block
	        font-size 12px
	        margin-top 20px
	        text-align center
	        color #999
	    .go_back
	      position absolute
	      top 5px
	      left 5px
	      width 30px
	      height 30px
	      >.iconfont
	        font-size 20px
	        color #999
</style>

