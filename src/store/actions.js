/*通过mutation间接更新state的多个方法的对象 */
//引入方法名
import {
	RESET_USER_INFO,
	RECEIVE_USER_INFO,
	RECEIVE_USERS
} from './mutation-types.js'
//引入用封装的ajax请求的方法
import {
	reqUserInfo,
	reqLogout,
} from "../api/index.js"

export default {
	
	//同步记录用户信息
	saveUser({commit}, userInfo) {
		commit(RECEIVE_USER_INFO, {userInfo})
	},
	//同步记录用户信息
	saveUsers({commit}, requser) {
		commit(RECEIVE_USERS, {requser})
	},
	//异步获取登录用户信息
	async getUserInfo({commit}) {
		const result = await reqUserInfo()
		if (result.code === 0) {
			const userInfo = result.data
			commit(RECEIVE_USER_INFO, {
				userInfo
			})
		}
	},
	//异步登出
	async logout({commit}) {
		const result = await reqLogout()
		if (result.code === 0) {
			commit(RESET_USER_INFO)
		}
	}
}
