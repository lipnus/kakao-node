var express = require('express')
var app = express()
var router = express.Router(); // 라우터처리
var path = require('path') // 상대경로
var mysql = require('mysql') //express에 가면 mysql연동 정보가 있음

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

var user_pk=0;
var rec_count=0; //유저의 기록횟수를 저장
var bpm_sum=0; //bpm의 값

//가장 최 상위 두개의 장르와 무드(0은 null방지용으로 넣음)
var rank_genre=[[0,0],[0,0]];
var rank_mood=[[0,0],[0,0]];


//초기화
router.post('/reset', function(req,res){
 console.log("삭제");
 var query = connection.query('DELETE FROM `score_recommend` WHERE user_pk=?', [user_pk], function(err, rows) {
	if(err) throw err;

	responseData={};
	responseData.result="success";
	res.json(responseData)
 })
});


//시작
router.post('/', function(req,res){

	var token = req.body.token; //토큰(비로그인 상태이면 0이 온다)
	var type = req.body.type; //request면 리턴만 answer이면 등록까지

	user_pk=0;
	rec_count=0; //유저의 기록횟수를 저장

	//토큰을 이용하여 user_pk를 찾는다
	var sql = 'SELECT * FROM `user` WHERE token=?';
	var factor = [token];
	var query = connection.query(sql, factor, function(err, rows){
		if(err) throw err;

		for(let i=0; i<rows.length; i++){
			console.log(rows[i].pk);
		}

		if(rows.length > 0){
				user_pk=rows[0].pk;
				console.log("토큰:" + token + " / user_pk:" + user_pk);
				inputScore(req, res);
		}else{
			var responseData = {};
			responseData.result="token_error";
			res.json( responseData );
		}
	});//sql


	// inputScore(req, res);
	// recommendMusic(req, res);
})

//입력받은 정보를 DB에 기록
function inputScore(req, res){
	var recommend_pk = req.body.recommend_pk;
	var bpm = req.body.bpm;
	var type = req.body.type; //request, answer
	var genre1 = req.body.genre1;
	var genre2 = req.body.genre2;
	var mood1 = req.body.mood1;
	var mood2 = req.body.mood2;
	var mood3 = req.body.mood3;
	var score = req.body.score;

	console.log("type: " + type);

	//user의 score를 담고있는 row가 있는지 확인
	var sql = 'SELECT * FROM `score_recommend` WHERE user_pk=?';
	var factor = [user_pk];
	var query = connection.query(sql, factor, function(err, rows){
		if(err) throw err;

		if(rows.length > 0){ //테이블에 row가 이미 존재

			rec_count = rows[0].rec_count;
			bpm_sum = rows[0].bpm;

			if(type=="answer"){
				//여기에 수정내용을 집어넣어서 sql에 삽입
				var updateStr;
				if(genre1 != null && genre1 != ""){  updateStr = "`"+ genre1 +"`"+  "=" +"`"+ genre1 +"`"+ "+" + score; }
				if(genre2 != null && genre2 != ""){	updateStr = updateStr + "," + "`" + genre2 + "`" + "=" +"`"+ genre2 +"`"+ "+" + score; }
				if(mood1 != null && mood1 != ""){	updateStr = updateStr + "," + "`" + mood1 + "`" + "=" +"`"+ mood1 +"`"+ "+" + score; }
				if(mood2 != null && mood2 != ""){	updateStr = updateStr + "," + "`" + mood2 + "`" + "=" +"`"+ mood2 +"`"+ "+" + score; }
				if(mood3 != null && mood3 != ""){	updateStr = updateStr + "," + "`" + mood3 + "`" + "=" +"`"+ mood3 +"`"+ "+" + score; }

				console.log("업데이트 sql: " +  updateStr);

				//업데이트
				sql = 'UPDATE score_recommend SET rec_count=rec_count+1, bpm=bpm+'+ bpm + "," + updateStr + ' WHERE user_pk=?';
				factor = [user_pk];
				query = connection.query(sql, factor, function(err, rows){
					if(err) throw err;

					console.log("수정완료");
					rec_count = rec_count+1;
					insertHistory(req, res);
					// recommendMusic(req, res); //출력
				});
			}else{
				pickBest(req, res); //request인 경우 바로 이 단계로 이동
			}//if answer일경우


		}else{ //새로운 row추가
				console.log("새로운 row추가");
				sql = 'insert into score_recommend set ?';
				factor = {user_pk:user_pk};
				query = connection.query(sql, factor, function(err,rows) {
					if(err) throw err;

					//재귀
					inputScore(req, res);
				});
		}
	});//sql(SELECT)

}

//추천곡이 중복해서 나오지 않도록 DB에 기록
function insertHistory(req, res){

	let recommend_pk = req.body.recommend_pk;

	sql = 'insert into history_recommend set ?';
	factor = {user_pk:user_pk, recommend_pk:recommend_pk};
	query = connection.query(sql, factor, function(err,rows) {
		if(err) throw err;

		//다음코스
		pickBest(req, res);
	});

}

//가장 높은 장르와 무드를 찾는다
function pickBest(req, res){

	var sql = 'SELECT * FROM `score_recommend` WHERE user_pk=?';
	var factor = [user_pk];
	var query = connection.query(sql, factor, function(err, rows){
		if(err) throw err;

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
	 // console.log("베스트장르: " + rank_genre[0][0] + " / " +rank_genre[1][0]);
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
	// console.log("베스트무드: " + rank_mood[0][0] + " / " +rank_mood[1][0]);
	// for(let i=0; i<rank_genre.length; i++){
	// 	 console.log("정렬후 : " + rank_mood[i]);
	// }

	 recommendMusic(req, res);
	});//sql(SELECT)
}

//추천곡 정보를 반환
function recommendMusic(req, res){

	var sql = 'SELECT * FROM `sound_recommend` WHERE 1';
	var factor = [];
	var query = connection.query(sql, factor, function(err, rows){
		if(err) throw err;

		var n = Math.floor(Math.random() * (rows.length-1)) + 0;
		// console.log("지금카운트: " + rec_count + " n: " + n + "전체: " + rows.length);


		//중복체크
		var sql = 'SELECT * FROM `history_recommend` WHERE user_pk=?';
		var factor = [user_pk];
		var query = connection.query(sql, factor, function(err, rows2){
			if(err) throw err;

			if(rows2.length==0){
				console.log("기록없음");
				//n그대로 쓰면 됨(history_recommend에 기록된적 없음)
			}else{

				//전부 다 들었으면 중복허용rows.length-1
				if(rec_count > 35){
					console.log("한바퀴 다돌았다");
				}else{

					n_pk = rows[n].pk;

					for(let i=0; i<rows2.length; i++){
						if(n_pk==rows2[i].recommend_pk){
							console.log("pk: " + n_pk + " 중복");
							n = Math.floor(Math.random() * (rows.length-1)) + 0;
							n_pk = rows[n].pk;
							i=-1;
						}
					}//for

				}//else(한바퀴 돌지는 않음)
			}//else

			var responseData = {};
			responseData.result="ok";
			responseData.recommend_pk = rows[n].pk;
			responseData.youtube = rows[n].youtube;
			responseData.bpm = rows[n].bpm;
			responseData.genre1 = rows[n].genre1;
			responseData.genre2 = rows[n].genre2;
			responseData.mood1 = rows[n].mood1;
			responseData.mood2 = rows[n].mood2;
			responseData.mood3 = rows[n].mood3;

			//통계정보
			responseData.rec_count = rec_count;
			console.log("카운터: " + rec_count);
			responseData.bpm_sum = bpm_sum;
			responseData.rank_genre1 = rank_genre[0][0];
			responseData.rank_genre2 = rank_genre[1][0];
			responseData.rank_mood1 = rank_mood[0][0];
			responseData.rank_mood2 = rank_mood[1][0];

			res.json( responseData );

		});//중복체크sql
})//sql
}



module.exports = router;
