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
	let music_pk = req.body.music_pk;
	let answer = req.body.answer;
	let try_count = req.body.try_count;

	recordHistory(req, res); //데이터를 기록

	//답안체크
	var sql = 'SELECT * FROM `music` WHERE pk=?';
	var factor = [music_pk];
	var query = connection.query(sql, factor, function(err, rows){
		if(err) throw err;

		//[채점]=====================================================================
		var responseData = {result:"wrong", score:0};
		if(try_count==1){ responseData.score=3; }
		else if(try_count == 2){ responseData.score=2; }
		else{ responseData.score=1;}
		//==========================================================================

		if( rows[0].name_answer.indexOf(answer) != -1 ){
			console.log("정답!: ", rows[0].name_answer);

			//음원테이블에 정보를 기록
			sql = 'UPDATE music SET correct=correct+1 where pk=?';
			factor = [music_pk];
			query = connection.query(sql, factor, function(err, rows){
				if(err) throw err;
				responseData.result="correct";
				res.json( responseData );
			});//sql(update)

		}else{

			//오답기록
			sql = 'insert into history set ?';
			factor = {naver_id:naver_id, music_pk:music_pk,	answer:answer, try_count:try_count};
			query = connection.query(sql, factor, function(err,rows) {
				if(err) throw err;
			res.json( responseData );
			})//sql(insert)
		}

	});//sql
});//post


function recordHistory(req, res){

	console.log("데이터카운트");
	let naver_id = req.body.naver_id;
	let music_pk = req.body.music_pk;
	let answer = req.body.answer;
	let try_count = req.body.try_count;

	//음악정보 기록(반응 필요없음)
	if(try_count==1){
			sql = 'UPDATE music SET attend=attend+1, try=try+1 where pk=?';
	}else{
			sql = 'UPDATE music SET try=try+1 where pk=?';
	}
	factor = [music_pk];
	query = connection.query(sql, factor, function(err, rows){
		if(err) throw err;
	});//sql(update)

}


module.exports = router;
