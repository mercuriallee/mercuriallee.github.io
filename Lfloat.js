const Lint = require('./Lint.js').Lint;

_ULfloat = function(str, llen) {
	this.str = str;
	this.llen = llen;
}

_ULfloat.prototype.toString = function() {
	let str = this.str;
	str = str.substr(0,this.llen)+'.'+str.substr(this.llen)
	return str;
}

//@return result _ULfloat
_ULfloat.prototype.lshift = function(bit) {

	const str = this.str;
	const llen = this.llen;

	if(bit == 0) {
		return new _ULfloat(str, llen);
	}

	const len = str.length;
	const rlen = len - llen;

	if(bit > 0) {
		if(bit <= rlen) {
			return new _ULfloat(str, llen + bit);
		}
		else {
			return new _ULfloat(str.concat('0'.repeat(bit-rlen)), llen + bit);
		}
	} else {
		bit = -bit;
		if(bit < llen){
			return new _ULfloat(str, llen - bit);
		} else {
			return new _ULfloat('0'.repeat(bit - llen + 1).concat(str), 1);
		}
	}

}

_ULfloat.prototype.clean_zeros = function(left) {
	if(left) {
		let llen = this.llen;
		let str = this.str;
		while(llen > 1) {
			if(str[0] === '0'){
				llen--;
				str = str.substr(1);
			} else {
				break;
			}
		}
		this.llen = llen;
		this.str  = str;
		return this;
	} else {
		let str = this.str;
		let last_index = str.length - 1;
		let rlen = str.length - this.llen;
		while(rlen > 0) {
			if(str[last_index] === '0') {
				rlen--;
				str = str.substr(0, last_index);
				last_index--;
			} else {
				break;
			}
		}
		this.str = str;
		this.llen = last_index + 1 - rlen;
		return this;
	}
}

_ULfloat.prototype.add = function(o) {
	const rlen1 = this.str.length - this.llen;
	const rlen2 = o.str.length - o.llen;
	const max = Math.max(rlen1, rlen2);
	const lint1 = new Lint(this.lshift(max).str);
	const lint2 = new Lint(o.lshift(max).str);
	const res_lint = lint1.add(lint2);
	const res_lfloat = new _ULfloat(res_lint.str, res_lint.str.length);
	return res_lfloat.lshift(-max).clean_zeros(false);
}

_ULfloat.prototype.compare = function(o) {
	if(this.llen < o.llen){
		return -1;
	}
	if(this.llen > o.llen) {
		return 1;
	}
	let str1 = this.str;
	let str2 = o.str;
	if(this.str.length < o.str.length) {
		str1 = this.str.concat('0'.repeat(o.str.length-this.str.length));
	} else if(this.str.length > o.str.length){
		str2 = o.str.concat('0'.repeat(this.str.length-o.str.length));
	}
	do {
		const len = str1.length;
		let i = 0;
		do {
			if(str1[i]<str2[i]){
				return -1;
			}else if(str1[i]>str2[i]){
				return 1;
			}
		}while(++i<len);
	}while(false)

	return 0;
}

_ULfloat.prototype.minus = function(o) {
	const rlen1 = this.str.length - this.llen;
	const rlen2 = o.str.length - o.llen;
	const max = Math.max(rlen1, rlen2);
	const lint1 = new Lint(this.lshift(max).str);
	const lint2 = new Lint(o.lshift(max).str);
	const res_lint = lint1.diff(lint2);
	const res_lfloat = new _ULfloat(res_lint.str, res_lint.str.length);
	return res_lfloat.lshift(-max).clean_zeros(false);
}

_ULfloat.prototype.diff = function(o) {
	if(this.compare(o) === -1) {
		return o.minus(this);
	}
	return this.minus(o);
}

_ULfloat.prototype.mul = function(o) {
	const rlen1 = this.str.length - this.llen;
	const rlen2 = o.str.length - o.llen;
	const lint1 = new Lint(this.str);
	const lint2 = new Lint(o.str);
	const res_lint = lint1.mul(lint2);
	const res_lfloat = new _ULfloat(res_lint.str, res_lint.str.length);
	return res_lfloat.lshift(-rlen1-rlen2).clean_zeros(false);
}

//most difficult part.
_ULfloat.prototype.div = function(o, precision=16) {
	const llen1 = this.llen;
	const rlen2 = o.str.length - o.llen;
	const max = rlen2 + precision;
	const lint1 = new Lint(this.lshift(max).str.substr(0,llen1+max));
	const lint2 = new Lint(o.str);
	const res_lint = lint1.div(lint2);
	const res_lfloat = new _ULfloat(res_lint.str, res_lint.str.length-precision);
	return res_lfloat;
}

module.exports = {
	_ULfloat : _ULfloat
}
