var express = require('express')
var app = express()
var router = express.Router(); // 라우터처리
var path = require('path') // 상대경로
var mysql = require('mysql') //express에 가면 mysql연동 정보가 있음
var nodemailer = require('nodemailer');

// AWS RDS연결
var connection = mysql.createConnection({
	host : 'allthebeat.csygoyq4caou.ap-northeast-2.rds.amazonaws.com',
	port : 3306,
	user : 'allthebeat',
	password : '1q2w3e4r!',
	database : 'allthebeat'
})

connection.connect();

router.get('/', function(req, res){
  console.log("test.js GET")
  res.render('mainpage', {'testValue' : "sound_list"})
});



router.post('/', function(req,res){

	var address = req.body.address;

  var name = req.body.name;
	var contact = req.body.contact;
  var worklink = req.body.worklink;
  var price = req.body.price;
  var add_info = req.body.add_info;
  var beat_name = req.body.beat_name;
  var beat_maker= req.body.beat_maker;

  var HTMLstr =
  "비트: " + beat_name + "</p>" +
  "비트메이커: " + beat_maker + "</p></p>" +

  "[구매자정보]" + "</p>" +
  "이름: " + name + "</p>" +
  "연락처: " + contact + "</p>" +
  "작업물링크: " + worklink + "</p>" +
  "가격: " + price + "</p>" +
  "추가요청사항: " + add_info + "</p>";

  responseData={result:"ok"};


  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'allthebeatmail@gmail.com',  // gmail 계정 아이디를 입력
      pass: 'allthebeat1'          // gmail 계정의 비밀번호를 입력
    },
    secureConnection: 'false',
    tls: {
        ciphers: 'SSLv3'
    }
  });

  let mailOptions = {
    from: '올더비트 <allthebeatmail@gmail.com>',    // 발송 메일 주소 (위에서 작성한 gmail 계정 아이디)
    to: 'sunpil13@korea.ac.kr, sunpil13@naver.com, suri@maxcompany.co' + address,                     // 수신 메일 주소
    subject: '[All The Beat] 구매의뢰 - ' + name,   // 제목
    html: HTMLstr  // 내용
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
      res.json( responseData );
    }
  });




});//post


module.exports = router;
