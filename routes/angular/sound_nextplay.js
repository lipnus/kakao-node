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

	var sound_pk = req.body.sound_pk;

	//음원리스트
	var sql = 'SELECT sound_data.pk AS sound_pk, sound_data.sound_name, user.nickname, sound_data.sound_path FROM sound_data, user WHERE sound_data.user_pk=user.pk';
	var factor = [sound_pk];
	var query = connection.query(sql, factor, function(err, rows){
		if(err) throw err;

		var i =Math.floor(Math.random() * rows.length) + 0;

		var responseData = {};
				responseData.sound_pk= rows[i].sound_pk;
				responseData.sound_name=rows[i].sound_name;
				responseData.beatmaker_nickname=rows[i].nickname;
				responseData.sound_path=rows[i].sound_path;
		res.json( responseData );

	});//sql-1
});//post


module.exports = router;
