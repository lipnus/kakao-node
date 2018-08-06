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
  res.render('android_chat_behavior', {'testValue' : "적성유형"})
});


router.post('/', function(req,res){

	var script_pk = req.body.script_pk;
	var sequence = Number(req.body.sequence);
	var userinfo_pk = req.body.userinfo_pk;

	var answer_type = req.body.answer_type;
	var answer = req.body.answer;

	var integer_sequence = Math.floor(sequence); //소수점 버린 정수(원래 정수인 애는 그냥 정수)
	var lower_sequence = Math.round((sequence - integer_sequence)*100); //소수점 아래 두자리(정수인 경우 0)


	console.log("시퀸스: " + sequence + " / " + integer_sequence + " / " + lower_sequence);

	//============================================================================
	// 단수선택
	//============================================================================
	if(answer_type=="single"){

		//다음순서
		sequence++;

		if(answer!="none"){

			sql = 'insert into raw_aptitude set ?';
			factor = {user_fk:userinfo_pk, question_fk:script_pk, answer:answer};

			query = connection.query(sql, factor, function(err,rows) {
				if(err) throw err;
				responseChat(res, sequence);
			});


		} else{
			responseChat(res, sequence);
		}


	//============================================================================
	// 복수선택(answer_type이 single이 아닌경우)
	//============================================================================
	}else{
		var total; //전체 복수선택 문항개수
		var count;

		if(answer_type=="multi_1"){ total=60; count = 10; } //총 60개, 10개씩 끊어서
		else if(answer_type=="multi_2"){ total=32; count=4; } //총32개, 4개식 끊어서
		else if(answer_type=="multi_3"){ total=0; count=99; } // 모두선택, 가진것을 모두 보냄

		//[복수선택 시작]
		if(lower_sequence==0){

			sequence = Number(sequence) + 0.01;
			responseMultiChat(res, sequence, integer_sequence, count);

		}

		//[복수선택 끝]
		else if(lower_sequence==total || answer_type=="multi_3" ){

			// ***등록
			var answerList = JSON.parse(answer); //배열 안에 object가 들어있음

			arr = [];
			for(var i=0; i<answerList.length; i++){
				arr.push([userinfo_pk ,answerList[i].question_pk, answerList[i].answer]);
			}


			sql = 'insert into raw_aptitude (user_fk, question_fk, answer) VALUE ?';
			factor = arr;

			query = connection.query(sql, [factor], function(err,rows) {
				if(err) throw err;

				integer_sequence = Number(integer_sequence) +1;
				responseChat(res, integer_sequence);
			});



		}

		//[복수선택 중간]
		else{

			// ***등록
			var answerList = JSON.parse(answer); //배열 안에 object가 들어있음

			arr = [];
			for(var i=0; i<answerList.length; i++){
				arr.push([userinfo_pk ,answerList[i].question_pk, answerList[i].answer]);
			}


			sql = 'insert into raw_aptitude (user_fk, question_fk, answer) VALUE ?';
			factor = arr;

			query = connection.query(sql, [factor], function(err,rows) {
				if(err) throw err;

				sequence = Number(sequence) + 0.01;
				responseMultiChat(res, sequence, integer_sequence, count);
			});

		}
	}
})//post


//다음 채팅내용 반환(하나 선택)
function responseChat(res, sequence){

	var responseData = {};

	sql = 'SELECT script_aptitude.pk AS script_pk, script_aptitude.sequence AS script_sequence, script, type, experienced, choice_aptitude.pk AS choice_pk, choice_aptitude.sequence AS choice_sequence, choice, custom_script, information FROM script_aptitude LEFT JOIN choice_aptitude ON script_aptitude.pk = choice_aptitude.question_fk WHERE script_aptitude.sequence=? ORDER BY choice_aptitude.sequence ASC;';

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

//다음 채팅내용 반환(복수선택)
function responseMultiChat(res, sequence, integer_sequence, count){

	var responseData = {};

	sql = 'SELECT script.pk AS script_pk, script.type, script.script, script.experienced, answer.pk AS choice_pk, answer.script AS choice, answer.sequence AS sequence FROM `script_aptitude` AS script JOIN `script_aptitude` AS answer WHERE script.sequence=? AND answer.sequence >= ? AND answer.sequence < ? ORDER BY answer.sequence ASC;';

	var end_sequence = Number(sequence) + 0.01*Number(count);
	factor = [integer_sequence, sequence, end_sequence];

	var query = connection.query(sql, factor, function(err, rows) {
		if(err) throw err;

		responseData.type = rows[0].type;
		responseData.sequence = rows[rows.length-1].sequence; //답변의 가장 마지막 sequence(double)를 전송
		responseData.script_pk = rows[0].script_pk;
		responseData.script = rows[0].script;
		responseData.experienced = rows[0].experienced;


		//답변
		responseData.answer = [];
		for(var i=0; i<rows.length; i++){
			var obj = {choice_pk:rows[i].choice_pk, choice:rows[i].choice, custom:"0", information:"0"};
			responseData.answer.push(obj);
		}//for


		res.json(responseData);
	});
}

module.exports = router;
