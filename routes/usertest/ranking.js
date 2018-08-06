var express = require('express')
var app = express()
var router = express.Router(); // 라우터처리
var path = require('path') // 상대경로
var mysql = require('mysql') //express에 가면 mysql연동 정보가 있음

// mysql연결
var connection = mysql.createConnection({
	host : 'ec2-13-125-247-189.ap-northeast-2.compute.amazonaws.com',
	port : 3306,
	user : 'root',
	password : 'wptlel',
	database : 'usertest'
})

connection.connect();



router.get('/', function(req, res){
  console.log("test.js GET")
  res.render('mainpage', {'testValue' : "sound_list"})
});



router.post('/', function(req,res){

	let naver_id = req.body.naver_id;

	//유저데이터를 점수에 따라 출력
	var sql = 'SELECT * FROM `user` WHERE 1 ORDER BY score DESC';
	var factor = [];
	var query = connection.query(sql, factor, function(err, rows){
		if(err) throw err;

		let responseData = [];
		for(let i=0; i<rows.length; i++){


			let obj = {
				user_pk: rows[i].pk,
				nickname: rows[i].nickname,
				score: rows[i].score
			};

			responseData.push(obj);
		}//for

		res.json( responseData );

	});//sql
});//post

module.exports = router;
