const assert = require('assert');
const _ULfloat = require('./Lfloat.js')._ULfloat;

describe('Test for _ULfloat add function', function(){
	it('should work fine with random numbers:', function(){
		this.timeout(5000);
		for(let i=0; i<1000; i++) {
			let min = 0;
			let max = 9999;
			let rand1 = Math.random() * (max - min) + min;
			let rand2 = Math.random() * (max - min) + min;
			let sum_exp = rand1 + rand2;
			let sum_act = float2UF(rand1).add(float2UF(rand2));
			if(float_equal(sum_exp, sum_act)){
				assert.equal(1, 1);
			}else {
				console.log(`Expected: ${sum_exp}`);
				console.log(`Actural : ${sum_act}`);
				console.log(`rand1: ${rand1}`);
				console.log(`rand2: ${rand2}`);
				assert.equal(1,0);
			}
		}
	});
});

describe('Test for _ULfloat minus function', function(){
	it('should work fine with random numbers:', function(){
		this.timeout(5000);
		for(let i=0; i<1000; i++) {
			let min = 0;
			let max = 9999;
			let rand1 = Math.random() * (max - min) + min;
			let rand2 = Math.random() * (max - min) + min;
			if(rand1 < rand2) {
				let tmp = rand1;
				rand1 = rand2;
				rand2 = tmp;
			}
			let sum_exp = rand1 - rand2;
			let sum_act = float2UF(rand1).minus(float2UF(rand2));
			if(float_equal(sum_exp, sum_act)){
				assert.equal(1, 1);
			}else {
				console.log(`Expected: ${sum_exp}`);
				console.log(`Actural : ${sum_act}`);
				console.log(`rand1: ${rand1}`);
				console.log(`rand2: ${rand2}`);
				assert.equal(1,0);
			}
		}
	});
});

describe('Test for _ULfloat mul function', function(){
	it('should work fine with random numbers:', function(){
		this.timeout(5000);
		for(let i=0; i<1000; i++) {
			let min = 0;
			let max = 9999;
			let rand1 = Math.random() * (max - min) + min;
			let rand2 = Math.random() * (max - min) + min;
			if(rand1 < rand2) {
				let tmp = rand1;
				rand1 = rand2;
				rand2 = tmp;
			}
			let sum_exp = rand1 * rand2;
			let sum_act = float2UF(rand1).mul(float2UF(rand2));
			if(float_equal(sum_exp, sum_act)){
				assert.equal(1, 1);
			}else {
				console.log(`Expected: ${sum_exp}`);
				console.log(`Actural : ${sum_act}`);
				console.log(`rand1: ${rand1}`);
				console.log(`rand2: ${rand2}`);
				assert.equal(1,0);
			}
		}
	});
});

describe('Test for _ULfloat div function', function(){
	it('should work fine with random numbers:', function(){
		this.timeout(5000);
		for(let i=0; i<1000; i++) {
			let min = 0;
			let max = 9999;
			let rand1 = Math.random() * (max - min) + min;
			let rand2 = Math.random() * (max - min) + min;
			if(rand1 < rand2) {
				let tmp = rand1;
				rand1 = rand2;
				rand2 = tmp;
			}
			let sum_exp = rand1 / rand2;
			let sum_act = float2UF(rand1).div(float2UF(rand2));
			if(float_equal(sum_exp, sum_act)){
				assert.equal(1, 1);
			}else {
				console.log(`Expected: ${sum_exp}`);
				console.log(`Actural : ${sum_act}`);
				console.log(`rand1: ${rand1}`);
				console.log(`rand2: ${rand2}`);
				assert.equal(1,0);
			}
		}
	});
});

function float2UF(float) {
	return new _ULfloat(float.toString().replace('.', ''), parseInt(float).toString().length);
}

function float_equal(f1, f2) {
	let isULfloat = f=>typeof(f) === 'object' && f instanceof _ULfloat;
	if(isULfloat(f1)) {
		if(isULfloat(f2)){
			return f1.toString() === f2.toString();
		} 
		if(typeof(f2) === 'number') {
			let diff = (parseFloat(f1.toString())-f2)/f2;
			return diff >= -0.000000000001 && diff <= 0.000000000001;
		}
	} else if(isULfloat(f2)){
		return float_equal(f2, f1);
	}
	else {
		throw new Error("Only can compare floats.");
	}
}
