var express = require('express');
var router = express.Router();
const md5 = require('blueimp-md5')
const models = require('../db/models')
const UserModel = models.getModel('user')
const _filter = {
	'pwd': 0,
	'__v': 0
} // 查询时过滤掉
const sms_util = require('../util/sms_util')
const voice_util = require('../util/voice_util')
const users = {}
var svgCaptcha = require('svg-captcha')

/*
密码登陆
 */
router.post('/login_pwd', function(req, res) {
	const name = req.body.name
	//对密码进行加密
	const pwd = md5(req.body.pwd)
	const captcha = req.body.captcha.toLowerCase()
	console.log('/login_pwd', name, pwd, captcha, req.session)

	// 可以对用户名/密码格式进行检查, 如果非法, 返回提示信息
	if (captcha !== req.session.captcha) {
		return res.send({
			code: 1,
			msg: '验证码不正确'
		})
	}
	// 删除保存的验证码
	delete req.session.captcha

	UserModel.findOne({
		name
	}, function(err, user) {
		if (user) {
			console.log('findUser', user)
			if (user.pwd !== pwd) {
				res.send({
					code: 1,
					msg: '密码不正确!'
				})
			} else {
				req.session.userid = user._id
				res.send({
					code: 0,
					data: {
						_id: user._id,
						name: user.name,
						phone: user.phone
					}
				})
			}
		} else {
			const userModel = new UserModel({
				name,
				pwd
			})
			userModel.save(function(err, user) {
				// 向浏览器端返回cookie(key=value)
				// res.cookie('userid', user._id, {maxAge: 1000*60*60*24*7})
				req.session.userid = user._id
				const data = {
					_id: user._id,
					name: user.name
				}
				// 3.2. 返回数据(新的user)
				res.send({
					code: 0,
					data
				})
			})
		}
	})
})

/*
一次性图形验证码
 */
router.get('/captcha', function(req, res) {
	var captcha = svgCaptcha.create({
		size:4,
		ignoreChars: '0o1l',
		noise: 5,
		color: true
	});
	// {data: '<svg.../svg>', text: 'abcd'}
	req.session.captcha = captcha.text.toLowerCase();
	console.log(req.session.captcha)
	/*res.type('svg');
	res.status(200).send(captcha.data);*/
	res.type('svg');
	res.send(captcha.data)
});

/*
发送验证码短信
*/
router.get('/sendcode', function(req, res, next) {
	//1. 获取请求参数数据
	var phone = req.query.phone;
	//2. 处理数据
	//生成验证码(6位随机数)
	var code = sms_util.randomCode(6);
	//发送给指定的手机号
	console.log(`向${phone}发送验证码短信: ${code}`);
	sms_util.sendCode(phone, code, function(success) { //success表示是否成功
		if (success) {
			users[phone] = code
			console.log('保存验证码: ', phone, code)
			res.send({
				"code": 0
			})
		} else {
			//3. 返回响应数据
			res.send({
				"code": 1,
				msg: '短信验证码发送失败'
			})
		}
	})
})

/*
发送语音验证码
*/
router.get('/voicecode', function(req, res, next) {
	//1. 获取请求参数数据
	var phone = req.query.phone;
	//2. 处理数据
	//生成验证码(6位随机数)
	var code = voice_util.randomCode(6);
	//发送给指定的手机号
	console.log(`向${phone}发送语音验证码: ${code}`);
	voice_util.voiceCode(phone, code, function(success) { //success表示是否成功
		if (success) {
			users[phone] = code
			console.log('保存验证码: ', phone, code,users[phone])
			res.send({
				"code": 0
			})
		} else {
			//3. 返回响应数据
			res.send({
				"code": 1,
				msg: '语音验证码发送失败'
			})
		}
	})
})

/*
短信登陆
*/
router.post('/login_sms', function(req, res, next) {
	var phone = req.body.phone;
	var code = req.body.code;
	console.log('/login_sms', phone, code);
	if (users[phone] != code) {
		res.send({
			code: 1,
			msg: '验证码错误！！！'
		});
		return;
	}
	//删除保存的code
	delete users[phone];

	UserModel.findOne({
		phone
	}, function(err, user) {
		if (user) {
			req.session.userid = user._id
			res.send({
				code: 0,
				data: user
			})
		} else {
			//存储数据
			const userModel = new UserModel({
				phone
			})
			userModel.save(function(err, user) {
				req.session.userid = user._id
				res.send({
					code: 0,
					data: user
				})
			})
		}
	})

})
/*
语音登陆
*/
router.post('/login_voice', function(req, res, next) {
	var phone = req.body.phone;
	var code = req.body.code;
	console.log('/login_voice', phone, code,users[phone]);
	if (users[phone] != code) {
		res.send({
			code: 1,
			msg: '验证码错误！！！'
		});
		return;
	}
	//删除保存的code
	delete users[phone];

	UserModel.findOne({
		phone
	}, function(err, user) {
		if (user) {
			req.session.userid = user._id
			res.send({
				code: 0,
				data: user
			})
		} else {
			//存储数据
			const userModel = new UserModel({
				phone
			})
			userModel.save(function(err, user) {
				req.session.userid = user._id
				res.send({
					code: 0,
					data: user
				})
			})
		}
	})
})

/*
根据sesion中的userid, 查询对应的user
 */
router.get('/userinfo', function(req, res) {
	// 取出userid
	const userid = req.session.userid
	// 查询
	UserModel.findOne({
		_id: userid
	}, _filter, function(err, user) {
		// 如果没有, 返回错误提示
		if (!user) {
			// 清除浏览器保存的userid的cookie
			delete req.session.userid

			res.send({
				code: 1,
				msg: '请先登陆'
			})
		} else {
			// 如果有, 返回user
			res.send({
				code: 0,
				data: user
			})
		}
	})
})

/*
查询对应的users
 */
router.get('/users', function(req, res) {
	var name = req.query.searchName;
	console.log('---',name)
	// 查询
	if(name){
		UserModel.find({name}, function(err, user) {
			// 如果没有, 返回错误提示
			if (!user.length) {
				res.send({
					code: 1,
					msg: '该用户不存在'
				})
			}else {
				// 如果有, 返回user
				res.send({
					code: 0,
					data: user
				})
			}
		})	
	}else{
		UserModel.find({}, function(err, user) {
				// 如果有, 返回user
				res.send({
					code: 0,
					data: user
				})
		})	
	}
})

// 修改密码
router.get('/update', function(req, res) {
	var updateName = req.query.updateName;
	var NewPwd = req.query.NewPwd;
	console.log(updateName, NewPwd)
	UserModel.update({
		name: updateName
	}, {
		$set: {
			pwd: md5(NewPwd)
		}
	}, function(err) {
		if (!err) {
			console.log("修改成功!!!");
		}
	})
})

// 删除用户
router.get('/remove', function(req, res) {
	var name = req.query.name;
	UserModel.remove({
		name
	},  function(err) {
		if (!err) {
			console.log("删除成功!!!");
		}
	})
})

//增加用户
router.get('/add_user', function(req, res) {
	var name = req.query.addName;
	//对密码进行加密
	var pwd = md5(req.query.addPwd);
	UserModel.findOne({name}, function(err, user) {
		if (user && (user.name != undefined)) {
				res.send({
					code: 1,
					msg: '用户已存在!'
				})
		} else {
			const userModel = new UserModel({
				name,
				pwd
			})
			userModel.save(function(err, user) {
				res.send({
					code: 0,
					msg: '用户增加成功!'
				})
			})
		}
	})
})

router.get('/logout', function(req, res) {
	// 清除浏览器保存的userid的cookie
	delete req.session.userid
	// 返回数据
	res.send({
		code: 0
	})
})





module.exports = router;
