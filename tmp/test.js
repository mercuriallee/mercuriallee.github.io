
function maxExp(n) {
	let m = n&(n-1);
	if(m == 0) {
		return n;
	}
	return maxExp(m);
}


for(let i=0; i<100; i++) {
	console.log(maxExp(i), i);
}

