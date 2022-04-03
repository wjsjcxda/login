/* 
包含n个接口请求函数的模块
函数的返回值：promise对象 
*/
import ajax from './ajax.js'
// const BASE_URL = 'http://localost:4000'
const BASE_URL = '/api'


//获取一次性验证码
export  const reqCaptcha = ()=>ajax(BASE_URL+'/captcha')
//用户名密码登陆
export  const reqPwdLogin = ({name,pwd,captcha})=>ajax(BASE_URL+'/login_pwd',{name,pwd,captcha},'POST')
//发送短信验证码
export  const reqCode = (phone)=>ajax(BASE_URL+'/sendcode',{phone})
//发送短信验证码
export  const reqVoiceCode = (phone)=>ajax(BASE_URL+'/voicecode',{phone})
//手机号验证码登陆
export  const reqPhoneLogin = (phone,code)=>ajax(BASE_URL+'/login_sms',{phone,code},'POST')
//手机号语音验证码登陆
export  const reqVoiceLogin = (phone,code)=>ajax(BASE_URL+'/login_voice',{phone,code},'POST')

//根据会话获取正在登陆用户信息
export const reqUserInfo = ()=>ajax(BASE_URL+'/userinfo')
// 用户登出
export  const reqLogout = ()=>ajax(BASE_URL+'/logout')

//根据会话获取用户信息
export const reqUser = ({searchName})=>ajax(BASE_URL+'/users',{searchName})

//修改密码
export const reqUpdate = ({updateName,NewPwd})=>ajax(BASE_URL+'/update',{updateName,NewPwd})

//删除用户
export const reqRemove = ({name})=>ajax(BASE_URL+'/remove',{name})

//增加用户
export const reqAdd = ({addName,addPwd})=>ajax(BASE_URL+'/add_user',{addName,addPwd})
