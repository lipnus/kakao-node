var express = require('express')
var app = express()
var router = express.Router(); // 라우터처리
var path = require('path') // 상대경로
var mysql = require('mysql') //express에 가면 mysql연동 정보가 있음

// mysql연결
var config = require('./function/config.js'); // AWS RDS연결
var connection = config.db_connection;





router.post('/download', function(req,res){

	let user_pk = req.body.user_pk;

	//사용자정보를 다운로드
	var sql = 'SELECT * FROM `user` WHERE pk=?';
	var factor = [user_pk];
	var query = connection.query(sql, factor, function(err, rows){
		if(err) throw err;


      let responseData = {};
      let userData = {
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
				perfect: rows[0].perfect,
				great: rows[0].great,
				bad: rows[0].bad

			};
      responseData.userData = userData;
			res.json( responseData );
	});//sql
});//post





router.post('/', function(req,res){

	let userData = req.body.userData;
  console.log(userData);

	sql = 'UPDATE user SET score_best=?, score_stage=?, stage=?, life=?,item1=?,item2=?,item3=?,m_order=? WHERE pk=?';
	factor = [
    userData.score_best,
    userData.score_stage,
    userData.stage,
    userData.life,
    userData.item1,
    userData.item2,
    userData.item3,
    userData.m_order,
    userData.user_pk
  ];
	query = connection.query(sql, factor, function(err, rows){
		if(err) throw err;

    console.log("음...");
    responseData = {result:"ok"};
    res.json( responseData );

  });//sql
});//post



module.exports = router;
