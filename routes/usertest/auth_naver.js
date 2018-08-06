var express = require('express')
var app = express()
var router = express.Router(); // 라우터처리
var request = require('request');
var path = require('path') // 상대경로
var mysql = require('mysql') //express에 가면 mysql연동 정보가 있음

// mysql연결
var connection = mysql.createConnection({
	host : 'ec2-13-125-247-189.ap-northeast-2.compute.amazonaws.com',
	port : 3306,
	user : 'root',
	password : 'wptlel',
	database : 'usertest'
})

connection.connect();

var nodePath = "http://ec2-13-125-247-189.ap-northeast-2.compute.amazonaws.com:9000";
var angularPath = "http://lipnus.com/#/";

// var nodePath = "http://localhost:9000/";
// var angularPath = "http://localhost:4200/#/";




var client_id = '9OJNhWuG6yafwYhzTuE2';
var client_secret = '7lzbr2sQEP';
var state = "";
var redirectURI = encodeURI(nodePath + "/auth_naver");
var api_url = "";
var access_token;

//네이버에서 콜백으로 부르는 곳
router.get('/', function (req, res) {
    let code = req.query.code;
    let state = req.query.state;

		console.log("code: " + code + " / state: " + state );

		api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id='
     + client_id + '&client_secret=' + client_secret + '&redirect_uri=' + redirectURI + '&code=' + code + '&state=' + state;
		var redquest = require('request');
		var options = {
        url: api_url,
        headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
    };
		request.get(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {

				let bodyData = JSON.parse(body);
				console.log("bodyData: ", bodyData);

				//임시 메칭 테이블에 업로드
				sql = 'insert into temp_token set ?';
				factor = {state:state, token:bodyData.access_token};
				query = connection.query(sql, factor, function(err,rows) {
					if(err) throw err;
					res.redirect(angularPath + "join/" + state);
				})//sql(insert)

			}

		});//get(2)
});//get(1)




//유저정보(Join에서 정보를 받기 위해 호출)
router.post('/userinfo', function(req,res){

	let state = req.body.state;
	console.log("state:" + state);



	var sql = 'SELECT * FROM `temp_token` WHERE state=?';
	var factor = [state];
	var query = connection.query(sql, factor, function(err, rows){
		if(err) throw err;

		if(rows.length > 0 ){
			console.log("temp_history에서 토큰확보");
			getUserInfo(req, res, state, rows[0].token);
		}else{
			console.log("토큰정보 없음");
			responseData = {result:"no_token"};
			res.json( responseData );
		}

	});//sql
});//post


function getUserInfo(req, res, state, token){

	var api_url = "https://openapi.naver.com/v1/nid/me";
	var request = require('request');
	var options = {
			url: api_url,
			headers: {'Authorization': "bearer" + " " + token}
	};

	request.get(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {

			let data = JSON.parse(body);

			responseData={};
			responseData.userinfo = data.response;
			// console.log("유저정보: ", data);



			//가입여부 확인
			var sql = 'SELECT * FROM `user` WHERE naver_id=?';
			var factor = [data.response.id];
			var query = connection.query(sql, factor, function(err, rows){
				if(err) throw err;

				if(rows.length > 0 ){
					console.log("이미 가입한 유저");
					responseData.result="joined";
				}else{
					console.log("신규가입 유저");
					responseData.result="newuser";
				}

				res.json(responseData);
			});//sql

		}//if
	});//get호출

}








router.post('/', function(req,res){
	console.log(req + " / " + res);
});//post


module.exports = router;
