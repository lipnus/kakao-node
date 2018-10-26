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
  res.render('mainpage', {'testValue' : "sound_detail"})
});



router.post('/', function(req,res){

	//토큰(비로그인 상태이면 0)
	token = req.body.token;
	search_text = req.body.search_text;
	console.log("검색어" + search_text);

	//토큰을 이용하여 user_pk를 찾는다
	if(token==0){
		sound_list(0, search_text, res);
	}
	else{

		var sql = 'SELECT * FROM `user` WHERE token=?';
		var factor = [token];
		var query = connection.query(sql, factor, function(err, rows){
			if(err) throw err;

			var user_pk = 0;
			user_pk=rows[0].pk;
			sound_list(user_pk, search_text, res);

		});//sql
	}

});//post


function sound_list(user_pk, search_text, res){


	//음원리스트
	var sql = 'SELECT sound_data.pk AS sound_pk, sound_data.sound_name, sound_data.sound_path, sound_data.bpm, user.nickname AS beatmaker_nickname, sound_data.img_path, sound_data.like_count, user_like.user_pk AS like_my FROM sound_data INNER JOIN user ON sound_data.user_pk = user.pk AND (sound_data.sound_name LIKE ? OR sound_data.genre1 LIKE ? OR sound_data.genre2 LIKE ? OR sound_data.type1 LIKE ? OR sound_data.type2 LIKE ? OR sound_data.type3 LIKE ? OR sound_data.mood1 LIKE ? OR sound_data.mood2 LIKE ? OR sound_data.mood3 LIKE ? OR user.nickname LIKE ? ) LEFT JOIN user_like ON sound_data.pk = user_like.sound_pk AND user_like.user_pk = ? ORDER BY sound_data.pk DESC';
	var factor =
	["%"+search_text+"%",
	"%"+search_text+"%",
	"%"+search_text+"%",
	"%"+search_text+"%",
	"%"+search_text+"%",
	"%"+search_text+"%",
	"%"+search_text+"%",
	"%"+search_text+"%",
	"%"+search_text+"%",
	"%"+search_text+"%", user_pk];
	var query = connection.query(sql, factor, function(err, rows){
		if(err) throw err;

		var responseData = {};

		//전체리스트
		responseData.sound_list = [];
		for(var i=0; i<rows.length; i++){

			var my_heart=0;
			// console.log(rows[i].sound_pk + " / "+ rows[i].like_my)
			if(rows[i].like_my != null){
				my_heart=1;
			}

			var obj = {
				sound_pk: rows[i].sound_pk,
				sound_name: rows[i].sound_name,
				sound_path: rows[i].sound_path,
				sound_bpm: rows[i].bpm,
				beatmaker_nickname: rows[i].beatmaker_nickname,
				img_path: rows[i].img_path,
				like_count: rows[i].like_count,
				like_my: my_heart
			};
			responseData.sound_list.push(obj);
		}; //for

		res.json( responseData );

	});//sql
}

module.exports = router;
