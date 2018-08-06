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



//유저의 정보를 갱신한다
router.post('/', function(req, res){
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
