var express = require('express')
var app = express()
var router = express.Router()
var router = express.Router(); // 라우터처리
var path = require('path') // 상대경로

var mysql = require('mysql') //express에 가면 mysql연동 정보가 있음

//간단한 함수들을 모아놓음
var simpleFunction = require('./jsfile/simple_function');

 // // AWS DATABASE SETTING
var connection = mysql.createConnection({
	host : 'hmtr-rds.cf3wzzk28tgn.ap-northeast-2.rds.amazonaws.com',
	port : 3306,
	user : 'humentory',
	password : 'humentory4132*',
	database : 'hmtr_db'
})


connection.connect();


router.get('/', function(req, res){
  console.log("test.js GET")
  res.render('android_chat_behavior', {'testValue' : "행동유형"})
});


router.post('/', function(req,res){

	var userinfo_pk = req.body.userinfo_pk;
	var root_sequence = req.body.root_sequence;
	var next_sequence = req.body.next_sequence;
	var answer = req.body.answer;



	//저장할 게 있음(1~5의 값)
	if(answer!="none"){

		console.log("저장할게 있음");

		sql = 'insert into raw_balance set ?';
		factor = {user_fk:userinfo_pk, question_fk:root_sequence, answer:answer};

		query = connection.query(sql, factor, function(err,rows) {
			if(err) throw err;
			responseChat(res, next_sequence);
		});
	}

	//스크립트
	else{

		console.log("스크립트");
		responseChat(res, next_sequence);

	}
})//post


//다음 채팅내용 반환
function responseChat(res, sequence){

	var responseData = {};

	sql = 'SELECT type, script_balance.sequence AS script_sequence, script_balance.pk AS script_pk, script, experienced, choice_balance.pk AS choice_pk, choice, result, next_seq, root_question_seq AS root_seq, custom_script, information FROM script_balance LEFT JOIN choice_balance ON script_balance.sequence = choice_balance.question_seq WHERE script_balance.sequence=? ORDER BY choice_balance.pk ASC;';
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
				var obj = {choice_pk:rows[i].choice_pk, choice:rows[i].choice, result:rows[i].result, next_seq:rows[i].next_seq, root_seq:rows[i].root_seq, custom:rows[i].custom_script, information:rows[i].information};
				responseData.answer.push(obj);
			}//for
		}//if

		res.json(responseData);
	});
}

module.exports = router;
