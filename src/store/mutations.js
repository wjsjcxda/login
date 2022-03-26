/* 直接更新state的多个方法的对象 */
import Vue from 'vue'
import {
	RESET_USER_INFO,
	RECEIVE_USER_INFO,
	RECEIVE_USERS
} from './mutation-types.js'

export default {
	[RECEIVE_USER_INFO](state, {userInfo}) {
		state.userInfo = userInfo
	},
	[RESET_USER_INFO](state) {
		state.userInfo = {}
	},
	[RECEIVE_USERS](state,{requser}){
		state.requser = requser
	}
}
