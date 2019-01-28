var crypto = require('crypto');

function cryptPwd(password) {
	var md5 = crypto.createHash('md5');
	return md5.update(password).digest('base64');
}

var password = '12345';

const N = 10000000;

console.time('cryption');
for(let i=0; i<N; i++) {
	password = cryptPwd(password);
}
console.log(password);
console.timeEnd('cryption');
