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

	//토큰(비로그인 상태이면 0이 온다)
	var token = req.body.token;
	var sound_pk = req.body.sound_pk;

	//토큰을 이용하여 user_pk를 찾는다
	if(token==0){
		sound_detail(0, sound_pk, res);
	}
	else{

		var sql = 'SELECT * FROM `user` WHERE token=?';
		var factor = [token];
		var query = connection.query(sql, factor, function(err, rows){
			if(err) throw err;

			var user_pk = 0;
			if(rows.length > 0){
					user_pk=rows[0].pk;
					sound_detail(user_pk, sound_pk, res);
			}else{
					sound_detail(0, sound_pk, res);
			}


		});//sql
	}
})//post



function sound_detail(user_pk, sound_pk, res){


	//음원정보
	var sql = 'select sound_data.pk AS sound_pk, sound_data.user_pk AS beatmaker_pk, user.nickname AS beatmaker_nickname, sound_data.sound_name, sound_data.bpm, sound_data.sound_path, sound_data.sound_path, sound_data.img_path, sound_data.genre1, sound_data.genre2, sound_data.mood1, sound_data.mood2, sound_data.mood3, sound_data.type1, sound_data.type2, sound_data.type3, sound_data.like_count, user_like.user_pk AS like_my from sound_data INNER JOIN user ON sound_data.pk=? AND sound_data.user_pk = user.pk LEFT JOIN user_like ON sound_data.pk = user_like.sound_pk AND user_like.user_pk=?';
	var factor = [sound_pk, user_pk];
	var query = connection.query(sql, factor, function(err, rows){
		if(err) throw err;

		//토큰값이 유효한지를 반환
		var login = 0;
		if(user_pk!=0){
			login=1;
		}

		//내가 좋아요 눌렀는지 확인
		var my_heart=0;
		if(rows[0].like_my != null){
			my_heart=1;
		}

		var responseData = {};
				responseData.login = login;
				responseData.sound_pk= rows[0].sound_pk;
				responseData.beatmaker_pk= rows[0].beatmaker_pk;
				responseData.beatmaker_nickname= rows[0].beatmaker_nickname;
				responseData.sound_path= rows[0].sound_path;
				responseData.sound_name= rows[0].sound_name;
				responseData.sound_bpm= rows[0].bpm;
				responseData.img_path= rows[0].img_path;
				responseData.genre1= rows[0].genre1;
				responseData.genre2= rows[0].genre2;
				responseData.mood1= rows[0].mood1;
				responseData.mood2= rows[0].mood2;
				responseData.mood3= rows[0].mood3;
				responseData.type1= rows[0].type1;
				responseData.type2= rows[0].type2;
				responseData.type3= rows[0].type3;
				responseData.like_count= rows[0].like_count;
				responseData.like_my= my_heart;
		res.json( responseData );

	});//sql-1
}

module.exports = router;
