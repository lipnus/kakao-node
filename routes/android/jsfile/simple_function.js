function test() {
		return "시발!!!";
}

exports.testFFF = test;


function getTimeStamp() {
		var d = new Date();

		var date = leadingZeros(d.getFullYear(), 4) +
				leadingZeros(d.getMonth() + 1, 2) +
				leadingZeros(d.getDate(), 2);

		var time = leadingZeros(d.getHours(), 2) + ':' +
				leadingZeros(d.getMinutes(), 2) + ':' +
				leadingZeros(d.getSeconds(), 2);

		return date;
}
exports.getTimeStamp = getTimeStamp;


function leadingZeros(n, digits) {
		var zero = '';
		n = n.toString();

		if (n.length < digits) {
				for (i = 0; i < digits - n.length; i++){
						zero += '0';
				}
		}
		return zero + n;
}
