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

	console.log("네이버아이디:"+ naver_id);

	//요청받은 음원정보 제공
	if(music_pk > 0){
		var sql = 'SELECT * FROM `music` WHERE pk=?';
		var factor = [music_pk];
		var query = connection.query(sql, factor, function(err, rows){
			if(err) throw err;

			let i=0;
			responseData = {};
			// console.log(i + "/ " + rows[i].pk);
			responseData.music_pk= rows[i].pk;
			responseData.music_name= rows[i].music_name;
			responseData.music_path= rows[i].music_path;
			responseData.youtube= rows[i].youtube;
			responseData.musician= rows[i].musician;
			responseData.album= rows[i].album;
			responseData.album_name= rows[i].album_name;
			responseData.date= rows[i].date;
			responseData.genre= rows[i].genre;

			res.json( responseData );

		});//sql
	}

	else{ //특별히 요청받은 게 없는 경우 순서대로 음원을 출제한다

		var sql = 'SELECT * FROM `music` WHERE 1';
		var factor = [];
		var query = connection.query(sql, factor, function(err, rows){
			if(err) throw err;

			//사용자가 진행했던 것을 참고하여 다음 음원을 제공
			var sql = 'SELECT * FROM `user` WHERE naver_id=?';
			var factor = [naver_id];
			var query = connection.query(sql, factor, function(err, rows2){
				if(err) throw err;


				let responseData = {result:"ok"};

				//문제가 다 떨어진 경우
				if(rows2[0].game_count >= rows.length){
					responseData.result="runout";
					res.json( responseData );
				}else{

					//정상출제
					let i = rows2[0].game_count;
					responseData.music_pk= rows[i].pk;
					responseData.music_name= rows[i].music_name;
					responseData.music_path= rows[i].music_path;
					responseData.youtube= rows[i].youtube;
					responseData.musician= rows[i].musician;
					responseData.album= rows[i].album;
					responseData.album_name= rows[i].album_name;
					responseData.date= rows[i].date;
					responseData.genre= rows[i].genre;

					console.log("네이버아이디: " + naver_id);
					//유저정보 기록(반응 필요없음)
					sql = 'UPDATE user SET game_count = game_count+1 where naver_id=?';
					factor = [naver_id];
					query = connection.query(sql, factor, function(err, rows){
						if(err) throw err;
						res.json( responseData );
					});//sql(update)

				}//if
			});
		});//sql
	}

});//post


module.exports = router;
