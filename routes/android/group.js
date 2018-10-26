var express = require('express')
var app = express()
var router = express.Router()
var router = express.Router(); // 라우터처리
var path = require('path') // 상대경로

var mysql = require('mysql') //express에 가면 mysql연동 정보가 있음

//간단한 함수들을 모아놓음
var simpleFunction = require('./jsfile/simple_function');

// mysql연결
var config = require('./function/config.js'); // AWS RDS연결
var connection = config.db_connection;


connection.connect();


router.get('/', function(req, res){
  console.log("test.js GET")
  // res.redirect('/test');

	text = simpleFunction.testFFF();
  res.render('android_group', {'testValue' : text})
});


router.post('/', function(req,res){

	var group_code = req.body.group_code;
  var responseData = {};

	var query = connection.query('select * from raw_group where group_code =?', [group_code], function(err, rows) {
		if(err) throw err;

    if(rows[0]) {
			if(rows[0].state == "open"){
				responseData.result = rows[0].name;
			}else{
				responseData.result = "close";
			}

		} else {
			responseData.result = "none";
		}
		res.json(responseData)
	})

})

module.exports = router;
