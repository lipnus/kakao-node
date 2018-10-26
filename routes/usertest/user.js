var express = require('express')
var app = express()
var router = express.Router(); // 라우터처리
var path = require('path') // 상대경로
var mysql = require('mysql') //express에 가면 mysql연동 정보가 있음

// mysql연결
var config = require('./function/config.js'); // AWS RDS연결
var connection = config.db_connection;



router.get('/', function(req, res){
  console.log("test.js GET")
  res.render('mainpage', {'testValue' : "sound_list"})
});


//유저를 DB에 등록
router.post('/', function(req,res){

	let naver_id = req.body.naver_id;
	let name = req.body.name;
	let nickname = req.body.nickname;
	let contact = req.body.contact;
	let age = req.body.age;
	let profile = req.body.profile;

	let gender = req.body.gender;


	sql = 'insert into user set ?';
	factor = {naver_id:naver_id, name:name, nickname:nickname, contact:contact, age:age,
	profile:profile, gender:gender};
	query = connection.query(sql, factor, function(err,rows) {
		if(err) throw err;

		responseData={};
		responseData.result="success";
		res.json(responseData)
	})//sql

});//post


module.exports = router;
