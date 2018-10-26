let mysql = require('mysql') //express에 가면 mysql연동 정보가 있음
 // AWS RDS연결
let db_connection = mysql.createConnection({
	host : '호스트주소',
	port : 3306,
	user : 'root',
	password : '비밀번호',
	database : '디비이름'
})
 exports.db_connection = db_connection;

 //해당 정보는 슬랙이나 구글드라이브 참조.
