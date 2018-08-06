var express = require('express')
var app = express()
var router = express.Router()
var router = express.Router(); // 라우터처리
var path = require('path') // 상대경로
var mysql = require('mysql') //express에 가면 mysql연동 정보가 있음

//간단한 함수들을 모아놓음
var simpleFunction = require('./jsfile/simple_function');

// // // LOCAL DATABASE SETTING
// var connection = mysql.createConnection({
//   host: 'localhost',
//   port: 3306,
//   user: 'root',
//   password: '1111',
//   database: 'lipnus'
// })

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
  // res.redirect('/test');
  res.render('android_user', {'testValue' : "안드로이드 - 유저"})
});


router.post('/', function(req,res){

	group_name = req.body.group_name;
	user_name  = req.body.user_name;
	user_birth = req.body.user_birth;
	user_phone = req.body.user_phone;
	user_email = req.body.user_email;
	user_count = req.body.user_count;

	now_date = simpleFunction.getTimeStamp();
 	responseData = {};


	//=====================================================
	// count=1(최초)
	//=====================================================
	if(user_count == 1){

		//검사한 적이 있는지 확인
		var sql = 'select * from raw_user where name=? AND birth=?';
		var factor = [user_name, user_birth];
		var query = connection.query(sql, factor, function(err, rows) {
			if(err) throw err;

			//검사한 적이 있는 경우
	    if(rows[0]) {

				user_pk = rows[0].pk;

				//검사횟수, 최근검사일을 찾아 반환
				sql = 'select * from raw_userinfo where user_fk=? order by count desc limit 1';
				factor = [user_pk];
				var query = connection.query(sql, factor, function(err, rows) {
					if(err) throw err;

					responseData.result = "already";
					responseData.date = rows[0].date;
					responseData.count =rows[0].count;
					responseData.userinfo_pk = 0;
					res.json(responseData);
				});

			}

			//첫 검사인 경우 - 바로 등록해준다(raw_user등록)
			else {
				sql = 'insert into raw_user set ?';
				factor = {name:user_name, birth:user_birth};
				query = connection.query(sql, factor, function(err,rows) {
					if(err) throw err;

					userinfo_pk = rows.insertId;

					//유저 group의 pk를 찾는다(user_info등록할때 필요)
					sql = 'select * from raw_group where name=?';
					factor = [group_name];
					var query = connection.query(sql, factor, function(err, rows) {
						if(err) throw err;

						group_pk = rows[0].pk;
						console.log("그룹pk: " + group_pk);

						//raw_userinfo등록한다
						sql = 'insert into raw_userinfo set ?';
						factor = {user_fk:userinfo_pk,
											group_fk:group_pk,
											agree:"true",
											phone:user_phone,
											email:user_email,
											date:now_date,
											count:1};
						query = connection.query(sql, factor, function(err,rows) {
							if(err) throw err;
							responseData.result = "success";
							responseData.date = "0";
							responseData.count = 0;
							responseData.userinfo_pk = rows.insertId;
							res.json(responseData)

						});//raw_userinfo 등록
					})//raw_group에서 pk를 가져욤
				});//raw_user 등록
			}//else if(raw_user에 없는 사용자)
		});//raw_user에 있는지 확인


		//=====================================================
		// count>1 (이미 등록한 적이 있다)
		//=====================================================
	} else if(user_count > 1){

		//이름과 그룹명으로 각각의 pk를 찾음
		var sql =
		'SELECT raw_group.pk AS group_pk, raw_userinfo.user_fk AS user_pk FROM raw_group, raw_user INNER JOIN raw_userinfo ON raw_user.pk = raw_userinfo.user_fk WHERE raw_group.name=? AND raw_user.name=? order by count desc limit 1';
		var factor = [group_name, user_name];
		var query = connection.query(sql, factor, function(err, rows) {
			if(err) throw err;

			user_pk = rows[0].user_pk;
			group_pk = rows[0].group_pk;

			sql = 'insert into raw_userinfo set ?';
			factor = {user_fk:user_pk,
								group_fk:group_pk,
								agree:"true",
								phone:user_phone,
								email:user_email,
								date:now_date,
								count:user_count};
			query = connection.query(sql, factor, function(err,rows) {
				if(err) throw err;

				responseData.result = "success";
				responseData.date = "0";
				responseData.count = 0;
				responseData.userinfo_pk = rows.insertId;
				res.json(responseData);

			});//raw_userinfo 재검사등록

		});//pk찾기



	}


})

module.exports = router;
