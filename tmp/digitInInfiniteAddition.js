function findDigit(n){
	n = n+1;
	return (seq1(n) + seq2(n) + carryBit(n))%10;
}

function seq1(n) {
	let bitLen = 1, offset = 0, accumulate = 0;
	while(offset + 9*bitLen*Math.pow(10, bitLen-1) < n) {
		offset += 9*bitLen*Math.pow(10, bitLen-1);
		accumulate += 9*10**(bitLen-1);
		bitLen++;
	}
	let pos = accumulate + Math.ceil((n-offset)/bitLen);
	let posOffset = (n-offset-1)%bitLen;
	return +((''+pos)[posOffset]);
}

function seq2(n) {
	let m = n;
	let bitLen = 0, offset = 0, nextOffset = 0, nums=0, accumulate=0;
	while (n>nextOffset) {

		offset = nextOffset;
		m -= nums;

		bitLen++;
		let top = bitLen < 16 ? 10**bitLen-1 : 10**bitLen-10;
		nums = Math.floor(top**0.5) - accumulate;
		nextOffset += nums*bitLen;
	}
	let pos = accumulate+Math.ceil((n-offset)/bitLen);
	let posOffset = (n-offset-1)%bitLen;
	return +((''+pos**2)[posOffset]);
}

function carryBit(n) {
	let sum = seq1(n+1)+seq2(n+1);
	if(sum > 9) {
		return 1;
	}
	if(sum < 9) {
		return 0;
	}
	return carryBit(n+1) > 0 ? 1 : 0;
}
console.log(findDigit(1728548092));
