<template>
	<section>
		<div id="top">
			<div id="top_logo">
				<span>欢迎登录用户管理界面</span>
			</div>
			<div id="search">
				<mt-button @click="search()">查询</mt-button>
			</div>
			<div id="add">
				<mt-button @click="addUser()">增加</mt-button>
			</div>
			<div id="top_links">
				<div id="top_op">
					<ul>
						<li>
							<img alt="当前用户" src="../../common/images/common/user.jpg">
							<span>{{userInfo.name}}</span>
						</li>
						<li>
							<img alt="事务月份" src="../../common/images/common/month.jpg">
							<span id="yue_fen">{{yue}}</span>
						</li>
						<li>
							<img alt="今天是" src="../../common/images/common/date.jpg">
							<span id="day_day">{{day}}</span>
						</li>
					</ul>
				</div>
				<div id="top_close">
					<mt-button @click="logout" style="position: relative; top: 5px; left: 15px;">退出</mt-button>
				</div>
			</div>
		</div>

		<table id="tb">
			<tr v-if="head" align="center">
				<td>用户名</td>
				<td>密码</td>
				<td>操作</td>
			</tr>
			<tr v-for="(user,index) in requser" :key='index'>
				<td>{{user.name || user.phone }}</td>
				<td>{{user.pwd || '无'}}</td>
				<td>
					<span class="button" @click="updatePwd(user.name)">修改密码</span>
					|&nbsp;<span class="button" @click="remove(user.name)">删除用户</span>
				</td>
			</tr>
		</table>
		<div id="update" v-if="update">

		</div>
		<div class="mask" v-if="update">
			<h1>请输入新的密码:</h1>
			<input name="NewPwd" v-model="NewPwd" /><button type="button" @click="toUpdate()">确定</button>
		</div>
		<div class="mask-user" v-if="ifAdd">
			<table class="add_table">
				<tr>
					<td>请输入新的用户名:</td>
					<td><input name="name" v-model="addName" /></td>
				</tr><br>
				<tr>
					<td>请输入用户的密码:</td>
					<td><input name="name" v-model="addPwd" /><br></td>
				</tr>
				<tr><button type="button" @click="add()" class="add_button">确定</button></tr>
			</table>
			
			
			
		</div>

<AlertTip :alertText="alertText" v-show="alertShow" @closeTip='closeTip'></AlertTip>
	</section>
</template>

<script>
	import {
		reqUser,
		reqUpdate,
		reqRemove,
		reqAdd
	} from '../../api/index.js'
	import {
		mapState
	} from 'vuex'
	import {
		MessageBox,
		Toast
	} from 'mint-ui'
	import AlertTip from '../../components/AlertTip/AlertTip.vue'
	export default {
		name: 'Manger',
		mounted() {
			var time = new Date();
			var myYear = time.getFullYear();
			var myMonth = time.getMonth() + 1;
			var myDay = time.getDate();
			var myHour = time.getHours();
			if (myMonth < 10) {
				myMonth = "0" + myMonth;
			}
			this.yue = myYear + "." + myMonth;
			this.day = myYear + "." + myMonth + "." + myDay + "." + myHour;
		},
		data() {
			return {
				myname: '',
				yue: '',
				day: '',
				head: false,
				update: false,
				ifAdd:false,
				addName:'',
				addPwd:'',
				NewPwd: '',
				updateName: '',
				alertText:'',//提示文本
				alertShow:false//是否显示警示框
			}
		},
		components:{AlertTip},
		computed: {
			...mapState(['requser', 'userInfo'])
		},
		methods: {
			//查询
			async search() {
				let result
				this.head = true
				result = await reqUser()
				this.$store.dispatch('saveUsers', result.data)
			},
			
			addUser(){
				this.ifAdd = true
			},
			//增加
			async add() {
				this.ifAdd = false
				let result
				const {
					addName,
					addPwd
				} = this
				if(addName && addPwd){
					result = await reqAdd({addName,addPwd})	
				}else{
					this.showAlert("用户名或密码不能为空！！！")
				}
				if(result.code===0){
					const msg = result.msg
					this.showAlert(msg)
				}else{
					const msg = result.msg
					this.showAlert(msg)
				}
				this.search()
			},
			updatePwd(name) {
				if (name && name != 'admin') {
					this.update = true
					this.updateName = name
				} else {
					this.showAlert('手机无需修改,管理员密码无法修改');
				}
			},
			toUpdate() {
				this.update = false
				const {
					updateName,
					NewPwd
				} = this
				reqUpdate({
					updateName,
					NewPwd
				})
				this.search()
			},

			//退出登录
			logout() {
				MessageBox.confirm('确认退出吗?').then(
					action => {
						//请求退出,发送请求
						this.$store.dispatch('logout')
						Toast('已成功登出')
						//请求退出，直接重置userInfo
						// this.$store.state.userInfo = {}
						this.$router.replace('./login')
					},
					action => {
						console.log('点击了取消')
					}
				);
			},

			//删除用户
			remove(name) {
				if (name === 'admin') {
					this.showAlert("管理员无法删除！！！")
				} else {
					reqRemove({
						name
					});
					this.search()
				}
			},
			//展示警告框
			showAlert(alertText){
				this.alertShow = true
				this.alertText = alertText
			},
			//关闭警告框
			closeTip(){
				this.alertShow = false
				this.alertText = ''
			}
		}
	}
</script>

<style scoped>
	#tb {
		width: 100%;
		position: absolute;
		top: 71px;
	}

	tr {
		text-align: center;
	}

	td {
		text-align: center;
	}

	.mask {
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		position: absolute;
		left: 0;
		top: 0;
		padding-top: 200px;
		box-sizing: border-box;
		text-align: center;
	}

	.mask-user{
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		position: absolute;
		left: 0;
		top: 0;
		padding-top: 200px;
		box-sizing: border-box;
		text-align: center;
	}
	.add_table{
		position: absolute;
		left: 40%;
		top: 30%;
	}
	.add_button{
		position: absolute;
		left: 50%;
		top: 150%;
	}
	.button:hover {
		cursor: pointer;
		background-color: #00B7FF;
	}

	#top {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 70px;
		background-color: #303030;
	}

	#top_logo {
		width: 300px;
		float: left;
		vertical-align: middle;
		height: 65px;
		line-height: 65px;
		padding: 1px 1px 1px 40px;
		color: white;
		font-family: 萝莉体;
	}

	#top_links {
		width: 480px;
		height: 65px;
		float: right;
		line-height: 65px;
		color: #ADADAD;
		line-height: 65px;
		position: relative;
	}

	#top_op {
		width: 400px;
	}

	#top_op ul {
		list-style-type: none;
		color: white;
		font-family: 萝莉体;
	}

	#top_op ul li {
		display: inline-block;
		margin-right: 20px;
	}

	#top_op ul li img {
		vertical-align: text-top;
	}

	#top_links a:link{
		list-style: none;
		text-decoration: none;
		color: #fff;
	}

	#top_links a:hover {
		list-style: none;
		text-decoration: underline;
		color: #fff;
	}

	#top_close {
		width: 80px;
		position: absolute;
		right: 0px;
		top: 0px;
		border-left: 1px solid #171717;
		vertical-align: text-top;
	}

	#logout {
		width: 100%;
		height: 100%;
	}

	#search {
		position: absolute;
		left: 25%;
		top: 15px;
		color: transparent;
	}

	#add {
		position: absolute;
		left: 40%;
		top: 15px;
		color: transparent;
	}
</style>
