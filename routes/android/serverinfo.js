var express = require('express')
var app = express()
var router = express.Router()
var router = express.Router(); // 라우터처리
var path = require('path') // 상대경로

var mysql = require('mysql') //express에 가면 mysql연동 정보가 있음

//간단한 함수들을 모아놓음
var simpleFunction = require('./jsfile/simple_function');

// // // LOCAL DATABASE SETTING
// var connection = mysql.createConnection({
//   host: 'localhost',
//   port: 3306,
//   user: 'root',
//   password: '1111',
//   database: 'lipnus'
// })

// // AWS DATABASE SETTING
var connection = mysql.createConnection({
	host : 'hmtr-rds.cf3wzzk28tgn.ap-northeast-2.rds.amazonaws.com',
	port : 3306,
	user : 'humentory',
	password : 'humentory4132*',
	database : 'hmtr_db'
})


connection.connect();


router.get('/', function(req, res){
  console.log("test.js GET")
  // res.redirect('/test');

	text = simpleFunction.testFFF();
  res.render('android_group', {'testValue' : text})
});


router.post('/', function(req,res){

	var version = req.body.version;
  var responseData = {};

	var query = connection.query('select * from raw_serverinfo where 1', function(err, rows) {
		if(err) throw err;

		responseData.version = rows[0].version;
		responseData.nickname = rows[0].nickname;
		responseData.imgpath = rows[0].imgpath;
		responseData.count_basic = rows[0].count_basic;
		responseData.count_behavior = rows[0].count_behavior;
		responseData.count_aptitude = rows[0].count_aptitude;
		responseData.count_balance = rows[0].count_balance;

		res.json(responseData);
	})

})

module.exports = router;
