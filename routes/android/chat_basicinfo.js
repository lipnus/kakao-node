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


router.get('/', function(req, res){
  console.log("test.js GET")
  res.render('android_chatbasic', {'testValue' : "기본정보 대화"})
});


router.post('/', function(req,res){

	var script_pk = req.body.script_pk;
	var sequence = req.body.sequence;
	var userinfo_pk = req.body.userinfo_pk;
	var answer = req.body.answer;

	sequence++; //클라이언트에서 받은 것 다음순서



	//동봉된 답변데이터가 있을경우, raw_basicinfo에 등록한다
	if(answer!="none"){

		sql = 'insert into raw_basicinfo set ?';
		factor = {user_fk:userinfo_pk, question_fk:script_pk, answer:answer};

		query = connection.query(sql, factor, function(err,rows) {
			if(err) throw err;
			responseChat(res, sequence);
		});

	} else{
		responseChat(res, sequence);
	}
})//post


//다음 채팅내용 반환
function responseChat(res, sequence){

	var responseData = {};

	sql = 'SELECT script_basicinfo.pk AS script_pk, script_basicinfo.sequence AS script_sequence, script, type, category, experienced, choice_basic.pk AS choice_pk, choice_basic.sequence AS choice_sequence, choice, custom_script, information FROM script_basicinfo LEFT JOIN choice_basic ON script_basicinfo.pk = choice_basic.question_fk WHERE script_basicinfo.sequence=? ORDER BY choice_basic.sequence ASC';
	factor = [sequence];
	var query = connection.query(sql, factor, function(err, rows) {
		if(err) throw err;

		responseData.type = rows[0].type;
		responseData.sequence = rows[0].script_sequence;
		responseData.script_pk = rows[0].script_pk;
		responseData.script = rows[0].script;
		responseData.experienced = rows[0].experienced;

		//답변
		responseData.answer = [];
		if(rows[0].type == "question"){
			for(var i=0; i<rows.length; i++){
				var obj = {choice_pk:rows[i].choice_pk, choice:rows[i].choice, custom:rows[i].custom_script, information:rows[i].information};
				responseData.answer.push(obj);
			}//for
		}//if

		res.json(responseData);
	});

}


module.exports = router;
