var express = require('express')
var app = express()
var router = express.Router(); // 라우터처리
var path = require('path') // 상대경로
var mysql = require('mysql') //express에 가면 mysql연동 정보가 있음

// mysql연결
var config = require('./function/config.js'); // AWS RDS연결
var connection = config.db_connection;




router.get('/', function(req, res){
  console.log("test.js GET")
  res.render('mainpage', {'testValue' : "sound_detail"})
});





//가장 최 상위 두개의 장르와 무드
var rank_genre=[["",0],["",0]];
var rank_mood=[["",0],["",0]];
var user_pk = 0;

var responseData={};


router.post('/', function(req,res){

	//토큰(비로그인 상태이면 0)
	token = req.body.token;
	console.log(token);

	//토큰을 이용하여 user_pk를 찾는다
	if(token==0){
		sound_list(0, res);
	}
	else{

		var sql = 'SELECT * FROM `user` WHERE token=?';
		var factor = [token];
		var query = connection.query(sql, factor, function(err, rows){
			if(err) throw err;

			var user_pk = 0;
			if(rows.length > 0){
					user_pk=rows[0].pk;
			}

			sound_list(user_pk, res);

		});//sql
	}
})//post

function sound_list(user_pk, res){

	//음원리스트
	var sql = 'SELECT sound_data.pk AS sound_pk, sound_data.sound_name, sound_data.sound_path, sound_data.bpm, user.nickname AS beatmaker_nickname, sound_data.img_path, sound_data.like_count, user_like.user_pk AS like_my FROM sound_data INNER JOIN user ON sound_data.user_pk = user.pk LEFT JOIN user_like ON sound_data.pk = user_like.sound_pk AND user_like.user_pk = ? ORDER BY sound_data.pk DESC';
	var factor = [user_pk];
	var query = connection.query(sql, factor, function(err, rows){
		if(err) throw err;

		var login = 0;
		if(user_pk!=0){
			login=1;
		}

		//토큰값이 유효한지, 추천이 되었는지 반환해줌
		responseData = {login:login, recommend:0};

		//전체리스트
		responseData.sound_list = [];
		for(var i=0; i<rows.length; i++){

			//내가 좋아요 눌렀는지
			var my_heart=0;
			// console.log(rows[i].sound_pk + " / "+ rows[i].like_my)
			if(rows[i].like_my != null){
				my_heart=1;
			}

			var obj = {
				sound_pk: rows[i].sound_pk,
				sound_name: rows[i].sound_name,
				sound_path: rows[i].sound_path,
				sound_bpm: rows[i].bpm,
				beatmaker_nickname: rows[i].beatmaker_nickname,
				img_path: rows[i].img_path,
				like_count: rows[i].like_count,
				like_my: my_heart
			};
			responseData.sound_list.push(obj);
		}; //for




		//추천리스트(5개)
		pickBest(user_pk, res);

	});//sql-1
}

//가장 높은 장르와 무드를 찾는다
function pickBest(user_pk, res){

	var sql = 'SELECT * FROM `score_recommend` WHERE user_pk=?';
	var factor = [user_pk];
	var query = connection.query(sql, factor, function(err, rows){
		if(err) throw err;

		console.log("pickBest()" + user_pk);

		//추천정보가 있고 추천과정이 완료됨
		if(rows.length > 0 && rows[0].rec_count>9){

			responseData.recommend = 1;

			rank_genre = [ ["Boombap", rows[0].Boombap],
										 ["Cloud", rows[0].Cloud],
										 ["Electronic", rows[0].Electronic],
										 ["FUTURE_BASS", rows[0].FUTURE_BASS],
										 ["G_funk", rows[0].G_funk],
										 ["HOUSE", rows[0].HOUSE],
										 ["Old_school", rows[0].Old_school],
										 ["POP", rows[0].POP],
										 ["RnB", rows[0].RnB],
										 ["Trap", rows[0].Trap],
										 ["Urban_Pop", rows[0].Urban_Pop],
										 ["Ratchet", rows[0].Ratchet],
										 ["WEST_COAST", rows[0].WEST_COAST],
									 ];
		 rank_genre = rank_genre.sort(function(a,b) { return a[1]<b[1]? 1:a[1]>b[1]?-1:0; });
		 console.log("베스트장르: " + rank_genre[0][0] + " / " +rank_genre[1][0]);
		 // for(let i=0; i<rank_genre.length; i++){
			//  	console.log("정렬후 : " + rank_genre[i]);
		 // }

		 rank_mood = [ ["bell", rows[0].bell],
										["calm", rows[0].calm],
										["club", rows[0].club],
										["dancehall", rows[0].dancehall],
										["dark", rows[0].dark],
										["dope", rows[0].dope],
										["dreamy", rows[0].dreamy],
										["emotional", rows[0].emotional],
										["ghetto", rows[0].ghetto],
										["happy", rows[0].happy],
										["hard", rows[0].hard],
										["jazzy", rows[0].jazzy],
										["lofi", rows[0].lofi],
										["mellow", rows[0].mellow],
										["positive", rows[0].positive],
										["power", rows[0].power],
										["relaxed", rows[0].relaxed],
										["smooth", rows[0].smooth],
										["summer", rows[0].summer],
										["synth", rows[0].synth],
										["trendy", rows[0].trendy],
										["twerk", rows[0].twerk],
										["wobble", rows[0].wobble],
										["nineties", rows[0].nineties]
									];
		rank_mood = rank_mood.sort(function(a,b) { return a[1]<b[1]? 1:a[1]>b[1]?-1:0; });
		console.log("베스트무드: " + rank_mood[0][0] + " / " +rank_mood[1][0]);
		}

		recommendList(res);
	});//sql(SELECT)
}

//추천리스트 생성
function recommendList(res){
	//음원리스트
	var sql = 'SELECT sound_data.pk AS sound_pk, sound_data.sound_name, sound_data.sound_path, sound_data.bpm, user.nickname AS beatmaker_nickname, sound_data.img_path, sound_data.like_count, user_like.user_pk AS like_my FROM sound_data INNER JOIN user ON sound_data.user_pk = user.pk AND (sound_data.genre1 LIKE ? OR sound_data.genre1 LIKE ? OR sound_data.genre2 LIKE ? OR sound_data.genre2 LIKE ?) LEFT JOIN user_like ON sound_data.pk = user_like.sound_pk AND user_like.user_pk = ? ORDER BY sound_data.pk DESC';
	var factor =
	["%"+rank_genre[0][0]+"%",	"%"+rank_genre[1][0]+"%", "%"+rank_genre[0][0]+"%",	"%"+rank_genre[1][0]+"%", user_pk];
	var query = connection.query(sql, factor, function(err, rows){
		if(err) throw err;

		console.log( rows.length +" / "+ rank_genre[0][0] + " / " + rank_genre[1][0]);

		responseData.sound_recommend_list = [];
		for(var i=0; i<5; i++){

			//랜덤추출
			var j =Math.floor(Math.random() * rows.length) + 0;

			//내가 좋아요 눌렀는지
			var my_heart=0;
			if(rows[j].like_my != null){
				my_heart=1;
			}

			var obj = {
				sound_pk: rows[j].sound_pk,
				sound_name: rows[j].sound_name,
				sound_path: rows[j].sound_path,
				sound_bpm: rows[j].bpm,
				beatmaker_nickname: rows[j].beatmaker_nickname,
				img_path: rows[j].img_path,
				like_count: rows[i].like_count,
				like_my: my_heart
			};
			responseData.sound_recommend_list.push(obj);
		}; //for

		console.log("추천시행여부: " + responseData.recommend);
		res.json( responseData );

	});//sql
}












//행렬순서를 섞는 함수
function shuffle(arr){
 if(arr instanceof Array){
	  var len = arr.length;
	  if(len == 1) return arr;
	  var i = len * 2;

		while(i > 0){
		   var idx1 = Math.floor(Math.random()* len);
		   var idx2 = Math.floor(Math.random()* len);

			 // var idx1 = Math.floor(0.5* len);
		   // var idx2 = Math.floor(0.3* len);

		   if(idx1 == idx2) continue;
		   var temp = arr[idx1];
		   arr[idx1] = arr[idx2];
		   arr[idx2] = temp;
		   i--;
	  }
	}
	else{
	  alert("No Array Object");
	}
	return arr;
}

module.exports = router;
