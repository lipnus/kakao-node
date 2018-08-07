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



router.post('/', function(req,res){

	let music_order = req.body.music_order;

	//사용자정보를 다운로드
	var sql = 'SELECT * FROM `music` WHERE music_order=?';
	var factor = [music_order];
	var query = connection.query(sql, factor, function(err, rows){
		if(err) throw err;

 
      let responseData = {};
      let musicData = {
				music_pk: rows[0].pk,
				name: rows[0].name,
				answer: rows[0].answer,
				initial: rows[0].initial,
				singer: rows[0].singer,
				path: rows[0].path,
				correct: rows[0].correct,
        wrong: rows[0].wrong,
			};
      responseData.musicData = musicData;

			res.json( responseData );
	});//sql
});//post









module.exports = router;
