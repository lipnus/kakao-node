var express = require('express')
var app = express()
var router = express.Router(); // 라우터처리
var path = require('path') // 상대경로
var mysql = require('mysql') //express에 가면 mysql연동 정보가 있음

// mysql연결
var config = require('./function/config.js'); // AWS RDS연결
var connection = config.db_connection;



router.post('/overlap', function(req,res){

	let nickname = req.body.nickname;

	sql = 'SELECT * FROM user WHERE nickname=?';
	factor = [nickname];
	query = connection.query(sql, factor, function(err, rows){
		if(err) throw err;

		responseData = {};
		if(rows.length > 0){
			responseData.overlap = "ok";
		}else{
			responseData.overlap = "no";
		}

		res.json( responseData );
	});//sql
});//post


router.post('/', function(req,res){

	let nickname = req.body.nickname;

	sql = 'insert into user set ?';
	factor = {nickname: nickname};
	query = connection.query(sql, factor, function(err,rows) {
		if(err) throw err;

		sql = 'SELECT pk FROM user WHERE nickname=?';
		factor = [nickname];
		query = connection.query(sql, factor, function(err, rows){
			if(err) throw err;

			responseData = {pk: rows[0].pk};
 			res.json( responseData );
		});//sql

	});//sql
});//post







module.exports = router;
