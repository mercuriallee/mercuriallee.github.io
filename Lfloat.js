const Lint = require('./Lint.js').Lint;

const _ULfloat = function(str, llen) {
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

_ULfloat.prototype.div = function(o, precision=16) {
	const llen1 = this.llen;
	const rlen2 = o.str.length - o.llen;
	const max = rlen2 + precision;
	const lint1 = new Lint(this.lshift(max).str.substr(0,llen1+max));
	const lint2 = new Lint(o.str);
	const res_lint = lint1.div(lint2);
	const res_lfloat = new _ULfloat(res_lint.str, res_lint.str.length).lshift(-precision);
	return res_lfloat;
}

const Lfloat = function(data, sign) {
	'use strict';
	if(this === undefined) {
		return new Lfloat(data, sign);
	}
	const type = typeof(data);
	if(data === undefined) {
		this.sign = 1;
		this._ulfloat = new _ULfloat('0', 1);
	}
	else if(type === 'number') {
		this.sign = data < 0;
		let str = this.sign ? data.toString().substr(1) : data.toString();
		this._ulfloat = new _ULfloat(str.replace('.', ''), str.concat('.').indexOf('.'));
	} else if(type === 'string') {
		if(data.length === 0) {
			return new Lfloat;
		}
		const matches = data.match(/^(-?)0*(\d+)\.?(\d*?)0*$/);
		if(matches === null) {
			throw new Error("Only numbers, a dot and maybe a dash can include in the String of Lfloat-Initialization.");
		}else {
			this.sign = matches[1].length != 0;
			this._ulfloat = new _ULfloat(matches[2]+matches[3], matches[2].length);
		}	
	}else if(type === 'object' && data instanceof _ULfloat) {
		this.sign = !!sign;
		this._ulfloat = data;
	}else {
		throw new Error("Parameters to Lfloat-Initialize can only be number or string.");
	}

	if(this._ulfloat.str === '0' && this.sign) {
		this.sign = 0;
	}

}

Lfloat.prototype.toString = function() {
	return (this.sign ? '-' : '').concat(this._ulfloat.toString());
}

Lfloat.prototype.add = function(o) {
	const type = typeof(o);
	if(type === 'object' && o instanceof Lfloat) {
		if(this.sign === o.sign) {
			const res_ufloat = this._ulfloat.add(o._ulfloat);
			return new Lfloat(res_ufloat, this.sign);
		} else {
			const res_ufloat = this._ulfloat.diff(o._ulfloat);
			return (this._ulfloat.compare(o._ulfloat) === -1 ? this : o).sign ? new Lfloat(res_ufloat, 0) : new Lfloat(res_ufloat, 1);
		}
	}
	else if(type === 'number' || type === 'string') {
		return this.add(new Lfloat(o));
	} else {
		throw new Error("Lfloat can only add a Lfloat, number, or a Lfloat-convertable string.");
	}
}

Lfloat.prototype.negation = function() {
	return new Lfloat(this._ulfloat, !this.sign);
}

Lfloat.prototype.minus = function(o) {
	return this.add(o.negation());
}

Lfloat.prototype.mul = function(o) {
	const type = typeof(o);
	if(type === 'object' && o instanceof Lfloat) {
		const res_ufloat = this._ulfloat.mul(o._ulfloat);
		return new Lfloat(res_ufloat, !(this.sign === o.sign));
	}
	else if(type === 'number' || type === 'string') {
		return this.mul(new Lfloat(o));
	} else {
		throw new Error("Lfloat can only add a Lfloat, number, or a Lfloat-convertable string.");
	}
}

Lfloat.prototype.div = function(o, precision=16) {
	const type = typeof(o);
	if(type === 'object' && o instanceof Lfloat) {
		if(o.str === '0') {
			return Infinity;
		}
		const res_ufloat = this._ulfloat.div(o._ulfloat, precision);
		return new Lfloat(res_ufloat, !(this.sign === o.sign));
	}
	else if(type === 'number' || type === 'string') {
		return this.div(new Lfloat(o));
	} else {
		throw new Error("Lfloat can only add a Lfloat, number, or a Lfloat-convertable string.");
	}
}

module.exports = {
	Lfloat : Lfloat
}
