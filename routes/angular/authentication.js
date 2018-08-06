var express = require('express')
var app = express()
var router = express.Router(); // 라우터처리
var path = require('path') // 상대경로
var mysql = require('mysql') //express에 가면 mysql연동 정보가 있음

// AWS RDS연결
var connection = mysql.createConnection({
	host : 'allthebeat.csygoyq4caou.ap-northeast-2.rds.amazonaws.com',
	port : 3306,
	user : 'allthebeat',
	password : '1q2w3e4r!',
	database : 'allthebeat'
})

connection.connect();



router.get('/', function(req, res){
  console.log("test.js GET")
  res.render('mainpage', {'testValue' : "sound_detail"})
});



router.post('/', function(req,res){

	id = req.body.id;
	password = req.body.password;

	//음원리스트
	var sql = 'SELECT * FROM `user` WHERE id=?';
	var factor = [id];
	var query = connection.query(sql, factor, function(err, rows){
		if(err) throw err;

		var responseData = {result:'no', error_msg:'', user_id:'', token:''};

		if(rows.length>0){
			if(rows[0].password == password){
				responseData.result = "ok";
				responseData.error_msg = "";
				responseData.user_id= rows[0].id;
				responseData.token = rows[0].pk;
			}else{
				responseData.error_msg = "비밀번호가 일치하지 않습니다";
			}
		}else{
			responseData.error_msg = "존재하지 않는 아이디입니다";
		}

		res.json( responseData );
	});//sql
});//post


module.exports = router;
