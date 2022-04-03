var md5 = require('blueimp-md5')
var moment = require('moment')
var Base64 = require('js-base64').Base64;
var request = require('request');

/*
 生成指定长度的随机数
 */
function randomCode(length) {
    var chars = ['0','1','2','3','4','5','6','7','8','9'];
    var result = ""; 
    for(var i = 0; i < length ; i ++) {
        var index = Math.ceil(Math.random()*9);
        result += chars[index];
    }
    return result;
}
// console.log(randomCode(6));
exports.randomCode = randomCode;

/*
向指定号码发送指定验证码
 */
function voiceCode(phone, code, callback) {
    var account = 'V61351415';
    var password = 'bcf53b698c9ddb5e316b0347c9e92312';
	var mobile = phone;
	var content = code;
    var url = 'http://api.voice.ihuyi.com/webservice/voice.php?method=Submit&account='+account+'&password='+password+'&mobile='+mobile+'&content='+content;


    //4. 发送请求, 并得到返回的结果, 调用callback
	  // callback(true);
    request({
		method : 'get',
        url : url,
        json : true,
		}, function (error, response, body) {
			console.log(error, response, body);
        callback(true);
    });
}

exports.voiceCode = voiceCode;

/*
voiceCode('18384362623', randomCode(6), function (success) {
    console.log(success);
})*/
