let mysql = require('mysql') //express에 가면 mysql연동 정보가 있음

// AWS RDS연결
let db_connection = mysql.createConnection({
	host : 'ec2-13-125-247-189.ap-northeast-2.compute.amazonaws.com',
	port : 3306,
	user : 'root',
	password : 'wptlel',
	database : 'kakao'
})

exports.db_connection = db_connection;
