'use strict';

const print = console.log;
String.prototype.reduce = Array.prototype.reduce;

/*
 * Binary-Int Module
 * this molude has no data validation for high performance.
 * should not use this module directly.
 */
function Bint(str) {
	this.str = str;
}

Bint.prototype.toString = function() {
	return this.str;
}

Bint.prototype.add = function(o) {
	const max_len = Math.max(this.str.length, o.str.length);
	const str1 = "0".repeat(max_len - this.str.length) + this.str;
	const str2 = "0".repeat(max_len - o.str.length) + o.str;
	const len = str1.length;

	let base = 0;
	let res = [];
	for(let i=len-1; i >= 0; i--) {
		let sum = 0;
		//0+x+base
		if(str1[i] === '0') {
			//0+0+base
			if(str2[i] === '0') {
				sum = base;
				base = 0;
			}
			//0+1+base
			else {
				//0+1+0
				if(base === 0) {
					sum = 1;
				//0+1+1
				} else {
					sum = 0;
				}
			}
		//1+x+base
		} else {
			//1+0+base
			if(str2[i] === '0') {
				//1+0+0
				if(base === 0) {
					sum = 1;
				}
				//1+0+1
				else {
					sum = 0;
				}
			//1+1+base
			} else {
				//1+1+0
				if(base === 0){
					sum = 0;
					base = 1;
				//1+1+1
				} else {
					sum = 1;
				}
			}
		}
		res.push(sum);
	}
	res.push(base);
	let res_len = res.length;
	while(res_len-- > 1) {
		if(res[res_len] === 0) {
			res.pop()
		} else {
			break
		}
	}
	let res_str = "";
	for(let i=res.length - 1; i>=0; i--) {
		res_str = res_str.concat(res[i]);
	}
	return new Bint(res_str);
}

Bint.prototype.mul = function(o) {
	let sum = new Bint("0");
	for(let c of o.str) {
		sum.str = sum.str.concat("0");
		if(c === "1"){
			sum = sum.add(this);
		}
	}
	let start = 0;
	const str = sum.str;
	const last_index = str.length - 1;
	for(let i=0; i<last_index; i++) {
		if(str[i] === '0'){
			start++;
		} else {
			break;
		}
	}
	sum.str = str.substr(start);
	return sum;
}

Bint.prototype.compareTo = function(o) {
	if(this.str.length > o.str.length) {
		return 1;
	}
	if(this.str.length === o.str.length) {
		for(let i=0; i<this.str.length; i++) {
			if(this.str[i] === o.str[i]) {
				continue;
			}
			if(this.str[i] === '0' && o.str[i] === '1') {
				return -1;
			}
			return 1;
		}
		//they are equal.
		return 0;
	}
	return -1;
}
Bint.prototype.lessThan = function(o) {
	return Bint.prototype.compareTo.call(this, o) === -1;
}

Bint.prototype.diff = function(o) {
	if(this.lessThan(o)) {
		return o.minus(this);
	}
	return this.minus(o);
}

Bint.prototype.minus = function(o) {
	const max_len = Math.max(this.str.length, o.str.length);
	const str1 = "0".repeat(max_len - this.str.length) + this.str;
	const str2 = "0".repeat(max_len - o.str.length) + o.str;
	const len = str1.length;

	let base = 0;
	let res = [];
	for(let i=len-1; i >= 0; i--) {
		let rest = 0;
		//0-x-base
		if(str1[i] === '0') {
			//0-0-base
			if(str2[i] === '0') {
				rest = base;
			}
			//0-1-base
			else {
				//0-1-0
				if(base === 0) {
					rest = 1;
					base = 1;
				//0-1-1
				} else {
					rest = 0;
				}
			}
		//1-x-base
		} else {
			//1-0-base
			if(str2[i] === '0') {
				//1-0-0
				if(base === 0) {
					rest = 1;
				}
				//1-0-1
				else {
					rest = 0;
					base = 0;
				}
			//1-1-base
			} else {
				//1-1-0
				if(base === 0){
					rest = 0;
				//1-1-1
				} else {
					rest = 1;
					base = 1;
				}
			}
		}
		res.push(rest);
	}
	//assert(base === 0);
	let res_len = res.length;
	while(res_len-- > 1) {
		if(res[res_len] === 0) {
			res.pop()
		} else {
			break
		}
	}
	let res_str = "";
	for(let i=res.length - 1; i>=0; i--) {
		res_str = res_str.concat(res[i]);
	}
	return new Bint(res_str);
}

Bint.prototype._div = function(o) {
	if(o.str === "0") {
		throw new Error("Cannot make division with ZERO.");
	}
	if(this.lessThan(o)) {
		return [new Bint("0"), new Bint(this.str)];
	}
	let operand = this.str.substr(0, o.str.length);
	const offset = operand.length;
	let res_len = this.str.length - o.str.length + 1;
	let res = Array(res_len);
	let mod = new Bint(0);
	do {
		let divident = this.str;
		let divisor = o.str;
		for(let i=0; i<res_len; i++) {
			if((new Bint(divisor)).compareTo(new Bint(operand)) === 1) {
				res[i] = 0;
				if(i === res_len - 1) {
					mod = new Bint(operand);
					break;
				}
				if(operand === '0') {
					operand = divident[offset+i];
				}
				else {
					operand = operand.concat(divident[offset+i]);
				}
			}else {
				res[i] = 1;
				if(i === res_len - 1) {
					mod = (new Bint(operand)).minus(new Bint(divisor));
					break;
				}
				const rest = (new Bint(operand)).minus(new Bint(divisor));
				if(rest.str === '0') {
					operand = divident[offset+i];
				} else {
					operand = rest.str.concat(divident[offset+i]);
				}
			}
		}
	} while(0);

	do{
		let start = 0;
		const last_index = res.length - 1;
		for(let i=0;i<last_index; i++) {
			if(res[i] === 0) {
				start++;
			} else {
				break;
			}
		}
		return [new Bint(res.slice(start).join('')), mod];
	}while(0);
}

Bint.prototype.div = function(o) {
	return Bint.prototype._div.call(this, o)[0];
}

Bint.prototype.mod = function(o) {
	return Bint.prototype._div.call(this, o)[1];
}

/*
 * Long-Int module
 */

function Lint(data) {
	'use strict';
	if(this === undefined) {
		return new Lint(data);
	}
	if(typeof(data) === "string") {
		const matches = data.match(/^0*(\d+)$/);
		if(matches === null) {
			throw new Error("Lint must initilize with number-string.");
		} else {
			let str = "0";
			if(matches[1].length) {
				str = matches[1];
			}
			this.str = str;
			this.bint = new Bint(dec2bin(str));
		}
	} else if(typeof(data) === "number"){
		this.str = data.toString(10);
		this.bint = new Bint(parseInt(data).toString(2));
	}else if(data instanceof Bint) {
		this.bint = data;
		this.str = bin2dec(data.str);
	} else {
		throw new Error("Lint should initilize with string or number");
	}
}

//#param dec is string
//#return string
function dec2bin(dec){
	let sum = new Bint('0');
	for(let i = 0; i<dec.length; i++) {
		sum = sum.mul(new Bint('1010'));
		switch(dec[i]) {
			case '0':
				break;
			case '1':
				sum = sum.add(new Bint('1'));
				break;
			case '2':
				sum = sum.add(new Bint('10'));
				break;
			case '3':
				sum = sum.add(new Bint('11'));
				break;
			case '4':
				sum = sum.add(new Bint('100'));
				break;
			case '5':
				sum = sum.add(new Bint('101'));
				break;
			case '6':
				sum = sum.add(new Bint('110'));
				break;
			case '7':
				sum = sum.add(new Bint('111'));
				break;
			case '8':
				sum = sum.add(new Bint('1000'));
				break;
			case '9':
				sum = sum.add(new Bint('1001'));
				break;
			default:
				throw new Error("Dec-str has not-num char.");
				break;
		}
	}
	return sum.str;
}

//#param bin is string
//#return string
function bin2dec(bin) {
	let bint = new Bint(bin);
	let dec = "";
	do{
		const [div, mod] = bint._div(new Bint('1010'));
		let char = '0';
		switch(mod.str) {
			case '0':
				break;
			case '1':
				char = '1';
				break;
			case '10':
				char = '2';
				break;
			case '11':
				char = '3';
				break;
			case '100':
				char = '4';
				break;
			case '101':
				char = '5';
				break;
			case '110':
				char = '6';
				break;
			case '111':
				char = '7';
				break;
			case '1000':
				char = '8';
				break;
			case '1001':
				char = '9';
				break;
			default:
				throw new Error("Intern Error.");
		}
		dec = char.concat(dec);
		bint = div;
	} while(bint.str !== '0') 

	return dec;
}

Lint.prototype.to_bin = function() {
	return this.bint;
}

Lint.prototype.add = function(o) {
	return new Lint(this.bint.add(o.bint));
}

Lint.prototype.mul = function(o) {
	return new Lint(this.bint.mul(o.bint));
}

Lint.prototype.diff = function(o) {
	return new Lint(this.bint.diff(o.bint));
}

Lint.prototype.div = function(o) {
	return new Lint(this.bint.div(o.bint));
}

Lint.prototype.mod = function(o) {
	return new Lint(this.bint.mod(o.bint));
}

Lint.prototype.toString = function() {
	return this.str;
}

if(!this.window) {
	module.exports = {
		Lint: Lint
	}
}
