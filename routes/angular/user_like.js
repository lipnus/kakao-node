var express = require('express')
var app = express()
var router = express.Router(); // 라우터처리
var path = require('path') // 상대경로
var mysql = require('mysql') //express에 가면 mysql연동 정보가 있음

// mysql연결
var config = require('./function/config.js'); // AWS RDS연결
var connection = config.db_connection;










router.post('/', function(req,res){

	token = req.body.token;
	sound_pk = req.body.sound_pk;
	heart = req.body.heart; //+1 또는 -1

	//like_count변경[1]
	sql = 'UPDATE sound_data SET like_count=like_count + ? WHERE pk=?';
	factor = [heart, sound_pk];
	query = connection.query(sql, factor, function(err, rows){
		if(err) throw err;


		//token으로 user_pk 찾기[2]
		var sql = 'SELECT * FROM `user` WHERE token=?';
		var factor = [token];
		var query = connection.query(sql, factor, function(err, rows){
			if(err) throw err;

			user_pk = rows[0].pk;
			responseData={result:"failure"};

			//하트추가
			if(heart==1){
				sql = 'insert into user_like set ?';
				factor = {sound_pk:sound_pk, user_pk:user_pk};

				query = connection.query(sql, factor, function(err,rows) {
					if(err) throw err;

					responseData.result="success";
 			 	 	res.json(responseData)
				});
			}
			//하트제거
			else if(heart==-1){
				var query = connection.query('DELETE FROM `user_like` WHERE user_pk=? AND sound_pk=?', [user_pk, sound_pk], function(err, rows) {
			 	 if(err) throw err;

			 	 responseData.result="success";
			 	 res.json(responseData)
			  })
			}//if

		});//sql[2]
	});//sql[1]
});//post






module.exports = router;
