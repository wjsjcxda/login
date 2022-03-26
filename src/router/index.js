// 路由器对象模块
import Vue from 'vue'
//引入路由
import Router from 'vue-router'
// 引入路由组件
// import Profile from '../pages/Profile/Profile.vue'

// 路由懒加载
const Profile = () => import('../pages/Profile/Profile.vue')

import Login from '../pages/Login/Login.vue'
import Manger from '../pages/Manger/Manger.vue'



Vue.use(Router)

export default new Router({
			routes: [{
					path: '/login',
					component: Login
				},
				{
					path: '/profile',
					component: Profile,
				},
				{
					path: '/manger',
					component: Manger
				},
				{
					path: '/',
					redirect: 'login'
				}]
			})
