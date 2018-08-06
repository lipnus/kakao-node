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



//token을 이용하여 유저정보를 가져온다
router.post('/', function(req, res){
	token = req.body.token;

	// console.log("token_please" + state);

	//state에 해당하는 token검색
	var sql = 'SELECT * FROM `user` WHERE token=?';
	var factor = [token];
	var query = connection.query(sql, factor, function(err, rows){
		if(err) throw err;

		var responseData = {};

		if(rows.length>0){
			responseData.result="success";
			responseData.id = rows[0].id;
			responseData.password = rows[0].password;
			responseData.role = rows[0].role;
			responseData.name = rows[0].name;
			responseData.nickname = rows[0].nickname;
			responseData.mobile = rows[0].mobile;
			responseData.email = rows[0].email;
			responseData.sns = rows[0].sns;
			responseData.introduce = rows[0].introduce;
			responseData.social_type = rows[0].social_type;
		}else{
			responseData.result="failure";
		}

		res.json( responseData );
	});//sql
});


//유저의 정보를 갱신한다
router.post('/update', function(req, res){
	var token = req.body.token;
	var nickname = req.body.nickname;
	var mobile = req.body.mobile;
	var sns = req.body.sns;
	var introduce = req.body.introduce;

	//확률이 적어 일단 안말들어 놨지만.. 토큰 유효성 검사하는 부분도 필요..

	responseData={};

	sql = 'UPDATE user SET nickname=?, mobile=?, sns=?, introduce=? WHERE token=?';
	factor = [nickname, mobile, sns, introduce, token];
	query = connection.query(sql, factor, function(err, rows){

		if(err) throw err;
		responseData.result="success";
		res.json( responseData );

	});
});



module.exports = router;
