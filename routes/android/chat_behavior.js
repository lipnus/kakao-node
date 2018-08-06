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

	var script_pk = req.body.script_pk;
	var sequence = req.body.sequence;
	var userinfo_pk = req.body.userinfo_pk;
	var answer = req.body.answer;

	sequence++; //클라이언트에서 받은 것 다음순서



	//동봉된 답변데이터가 있을경우, raw_basicinfo에 등록한다
	if(answer!="none"){

		sql = 'insert into raw_behavior set ?';
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

	sql = 'SELECT script_behavior.pk AS script_pk, script_behavior.sequence AS script_sequence, script, type, experienced, choice_behavior.pk AS choice_pk, choice_behavior.sequence AS choice_sequence, choice, custom_script, information FROM script_behavior LEFT JOIN choice_behavior ON 1 WHERE script_behavior.sequence=? ORDER BY choice_behavior.sequence ASC;';
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
