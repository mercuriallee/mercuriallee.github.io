const assert = require('assert');
const Lfloat = require('./Lfloat.js').Lfloat;

describe('Test for Lfloat add function', function(){
	it('should work fine with random numbers:', function(){
		this.timeout(5000);
		for(let i=0; i<1000; i++) {
			let min = -9999;
			let max = 9999;
			let rand1 = Math.random() * (max - min) + min;
			let rand2 = Math.random() * (max - min) + min;
			let sum_exp = rand1 + rand2;
			let sum_act = float2F(rand1).add(float2F(rand2));
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

describe('Test for Lfloat minus function', function(){
	it('should work fine with random numbers:', function(){
		this.timeout(5000);
		for(let i=0; i<1000; i++) {
			let min = -9999;
			let max = 9999;
			let rand1 = Math.random() * (max - min) + min;
			let rand2 = Math.random() * (max - min) + min;
			let sum_exp = rand1 - rand2;
			let sum_act = float2F(rand1).minus(float2F(rand2));
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

describe('Test for Lfloat mul function', function(){
	it('should work fine with random numbers:', function(){
		this.timeout(5000);
		for(let i=0; i<1000; i++) {
			let min = -9999;
			let max = 9999;
			let rand1 = Math.random() * (max - min) + min;
			let rand2 = Math.random() * (max - min) + min;
			let sum_exp = rand1 * rand2;
			let sum_act = float2F(rand1).mul(float2F(rand2));
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

describe('Test for Lfloat init function', function(){
	it('should work fine with random numbers:', function(){
		this.timeout(5000);
		for(let i=0; i<1000; i++) {
			let min = -9999;
			let max = 9999;
			let rand = Math.random() * (max - min) + min;
			let float1 = Lfloat(rand);
			let float2 = Lfloat(rand.toString());
			assert.equal(rand.toString(), float1);
			assert.equal(rand.toString(), float2);
		}
	});
});

describe('Test for Lfloat div function', function(){
	it('should work fine with random numbers:', function(){
		this.timeout(5000);
		for(let i=0; i<1000; i++) {
			let min = -9999;
			let max = 9999;
			let rand1 = Math.random() * (max - min) + min;
			let rand2 = Math.random() * (max - min) + min;
			let sum_exp = rand1 / rand2;
			let sum_act = float2F(rand1).div(float2F(rand2));
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

function float2F(float) {
	return Lfloat(float.toString());
}

function float_equal(f1, f2) {
	let isLfloat = f=>typeof(f) === 'object' && f instanceof Lfloat;
	if(isLfloat(f1)) {
		if(isLfloat(f2)){
			return f1.toString() === f2.toString();
		} 
		if(typeof(f2) === 'number') {
			let diff = (parseFloat(f1.toString())-f2)/f2;
			return diff >= -0.000000000001 && diff <= 0.000000000001;
		}
	} else if(isLfloat(f2)){
		return float_equal(f2, f1);
	}
	else {
		throw new Error("Only can compare floats.");
	}
}
