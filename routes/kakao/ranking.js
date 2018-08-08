var express = require('express')
var app = express()
var router = express.Router(); // 라우터처리
var path = require('path') // 상대경로
var mysql = require('mysql') //express에 가면 mysql연동 정보가 있음

// mysql연결
var config = require('./function/config.js'); // AWS RDS연결
var connection = config.db_connection;





router.post('/', function(req,res){

	let user_pk = req.body.user_pk;

	//사용자정보를 다운로드
	var sql = 'SELECT * FROM `user` WHERE pk=?';
	var factor = [user_pk];
	var query = connection.query(sql, factor, function(err, rows){
		if(err) throw err;


			responseData = {};
      userData = {
				user_pk: rows[0].pk,
				kakao_id: rows[0].kakao_id,
				nickname: rows[0].nickname,
				score_best: rows[0].score_best,
				score_stage: rows[0].score_stage,
				stage: rows[0].stage,
				life: rows[0].life,
        item1: rows[0].item1,
        item2: rows[0].item2,
        item3: rows[0].item3,
        m_order: rows[0].m_order,
			};

			//사용자정보를 다운로드
			var sql = 'SELECT count(*) AS rank FROM `user` WHERE score_best >= ?';
			var factor = [userData.score_best];
			var query = connection.query(sql, factor, function(err, rows){
				if(err) throw err;

					responseData.rank = rows[0].rank;
		      responseData.userData = userData;
					res.json( responseData );
			});//sql

	});//sql
});//post







module.exports = router;
