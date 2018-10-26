var express = require('express')
var app = express()
var router = express.Router(); // 라우터처리
var path = require('path') // 상대경로
var mysql = require('mysql') //express에 가면 mysql연동 정보가 있음

// mysql연결
var config = require('./function/config.js'); // AWS RDS연결
var connection = config.db_connection;

var nodePath = "http://ec2-13-125-247-213.ap-northeast-2.compute.amazonaws.com:9000";
var angularPath = "http://allthebeat.com/#";

// var angularPath = "http://localhost:4200/#";
// var nodePath = "http://localhost:9000";


var client_id = '0Pechfht9BVKa7WombfB';
var client_secret = 'AY61LczR1c';
var state = "";
var redirectURI = encodeURI(nodePath + "/auth_naver");
var api_url = "";



var access_token;

//요청 테스트
router.get('/fuck', function(req, res){
	api_url = 'https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=' + client_id + '&redirect_uri=' + redirectURI + '&state=' + state;
   res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
   res.end("<a href='"+ api_url + "'><img height='50' src='http://static.nid.naver.com/oauth/small_g_in.PNG'/></a>");
});





//state를 받아서 그에 해당하는 아이디의 token을 줌
router.post('/token_please', function(req, res){
	state = req.body.state;

	console.log("token_please" + state);

	//state에 해당하는 token검색
	var sql = 'SELECT * FROM `user` WHERE naver_state=?';
	var factor = [state];
	var query = connection.query(sql, factor, function(err, rows){
		if(err) throw err;

		var responseData = {token:0};

		if(rows.length>0){
			responseData.token = rows[0].token;
		}
		res.json( responseData );
	});//sql
});






//콜백
router.get('/', function (req, res) {
    code = req.query.code;
    state = req.query.state;

    api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id='
     + client_id + '&client_secret=' + client_secret + '&redirect_uri=' + redirectURI + '&code=' + code + '&state=' + state;
		var request = require('request');
		var options = {
        url: api_url,
        headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
    };

		//토큰 값 받기[1]
		request.get(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        // res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});

				var bodyData = JSON.parse(body);
				// console.log("엑세스_토큰: " + bodyData.access_token);
				// console.log("리프레쉬_토큰: " + bodyData.refresh_token);
				// console.log("토큰_타입: " + bodyData.token_type);

				access_token = bodyData.access_token;

				var api_url = "https://openapi.naver.com/v1/nid/me";
				var request = require('request');
				var options = {
		        url: api_url,
		        headers: {'Authorization': bodyData.token_type + " " + bodyData.access_token}
		    };


						//받은 토큰을 이용해서 유저정보 받기[2]
						request.get(options, function (error, response, body) {
				      if (!error && response.statusCode == 200) {

								var bodyData = JSON.parse(body);
								// console.log("성공여부: " + bodyData.message);
								// console.log("네이버고유번호: " + bodyData.response.id);
								// console.log("이름: " + bodyData.response.name);
								// console.log("이메일: " + bodyData.response.email);
								// console.log("스테이트: " + state);

								//로그인성공여부 확인
								if(bodyData.message === "success"){
									console.log("로그인 성공");

									//가입여부 확인
									var sql = 'SELECT * FROM `user` WHERE id=?';
									var factor = [bodyData.response.id];
									var query = connection.query(sql, factor, function(err, rows){
										if(err) throw err;

										if(rows.length>0){
											//가입되어 있음. 로그인 완료
											console.log("=> 가입된 사용자");

											sql = 'UPDATE user SET token=?, naver_state=? WHERE id=?';
											factor = [access_token, state, bodyData.response.id];
      								query = connection.query(sql, factor, function(err, rows){
        								if(err) throw err;
												// console.log("검색id : "+ bodyData.response.id);
												// console.log("토큰값: "+ access_token);

												// res.redirect('http://localhost:4200/naver/' + state);
												res.redirect(angularPath + '/naver/' + state);

        							});

										}else{
											//미가입, 추가정보 입력
											console.log("=> 신규 사용자");

											sql = 'insert into user set ?';
											factor = {id:bodyData.response.id, name:bodyData.response.name, email:bodyData.response.email, token:access_token, social_type:"naver", naver_state:state};
											query = connection.query(sql, factor, function(err,rows) {
												if(err) throw err;
												res.redirect(angularPath + '/join/' + state);
											});

										}//if
									});//가입여부 확인(sql)
								}//로그인 성공여부 확인(if)



				      } else {
				        res.status(response.statusCode).end();
				        console.log('error = ' + response.statusCode);
				      }
				  	});//받은 토큰을 이용해서 유저정보 받기[2]


      } else {
        res.status(response.statusCode).end();
        console.log('error = ' + response.statusCode);
      }
  	});//토큰 값 받기[1]
});






router.get('/callback', function(req, res){
  console.log("test.js GET")

	code = req.query.code;
  state = req.query.state;

	console.log("code: " + code + " / state: " + state);

	api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id='
     + client_id + '&client_secret=' + client_secret + '&redirect_uri=' + redirectURI + '&code=' + code + '&state=' + state;
    var request = require('request');
    var options = {
        url: api_url,
        headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
     };

    request.get(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
        res.end(body);
      } else {
        res.status(response.statusCode).end();
        console.log('error = ' + response.statusCode);
      }
    });

		res.render('mainpage', {'testValue' : code + " / " + state})

});








router.post('/', function(req,res){

	console.log(req + " / " + res);

});//post


module.exports = router;
