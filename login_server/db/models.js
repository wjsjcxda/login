/*
包含n个能操作mongodb数据库集合的model的模块
1. 连接数据库
  1.1. 引入mongoose
  1.2. 连接指定数据库(URL只有数据库是变化的)
  1.3. 获取连接对象
  1.4. 绑定连接完成的监听(用来提示连接成功)
2. 定义对应特定集合的Model
  2.1. 字义Schema(描述文档结构)
  2.2. 定义Model(与集合对应, 可以操作集合)
3. 向外暴露获取Model的方法
 */
const md5 = require('blueimp-md5')
// 1. 连接数据库
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/login_user')
const conn = mongoose.connection
conn.on('connected', function () {
  console.log('数据库连接成功!')
})

// 2. 得到对应特定集合的Model: UserModel
const userSchema = mongoose.Schema({
  // 用户名
  'name': {type: String},
  // 密码
  'pwd': {type: String},
  // 类型
  'phone': {type: String}
})
UserModel = mongoose.model('user', userSchema)

//向数据库中插入一个管理员账号
UserModel.find({name:'admin'},"name pwd -_id",function(err,docs){
	if(!err){
		if(docs == ''){
			UserModel.create({
				id:1,
				name:'admin',
				pwd:md5('admin')
			},function(err){
				if(!err){
					console.log("插入成功!!!");
				}
			});
		}
	}
});



// 3. 向外暴露
module.exports = {
  getModel(name) {
    return mongoose.model(name)
  }
}

