/**
 * @param {Number} num 1-9(字1-7);
 * @param {Number} style 0-3, 0 mean 筒, 1 mean 索, 2 mean 萬, 3 mean 字
 */
function Mahjong(num, style) {
	if(this === undefined) return new Mahjong(num, style);
	this.num = num;
	this.style = style;
}

/** @returns {Mahjong} */
Mahjong.prototype.clone = function() {
	return new Mahjong(this.num, this.style);
}

/**
 * @param {Mahjong} other
 * @returns {boolean}
 */
Mahjong.prototype.equalTo = function(other) {
	return this.num == other.num && this.style == other.style;
}

Mahjong.prototype.toEmoji = function() {
	if(this.num == -1) {
		return '🀫';
	}
	switch(this.style*10+this.num) {
		case  1: return '🀙';
		case  2: return '🀚';
		case  3: return '🀛';
		case  4: return '🀜';
		case  5: return '🀝';
		case  6: return '🀞';
		case  7: return '🀟';
		case  8: return '🀠';
		case  9: return '🀡';
		case 11: return '🀐';
		case 12: return '🀑';
		case 13: return '🀒';
		case 14: return '🀓';
		case 15: return '🀔';
		case 16: return '🀕';
		case 17: return '🀖';
		case 18: return '🀗';
		case 19: return '🀘';
		case 21: return '🀇';
		case 22: return '🀈';
		case 23: return '🀉';
		case 24: return '🀊';
		case 25: return '🀋';
		case 26: return '🀌';
		case 27: return '🀍';
		case 28: return '🀎';
		case 29: return '🀏';
		case 31: return '🀀';
		case 32: return '🀁';
		case 33: return '🀂';
		case 34: return '🀃';
		case 35: return '🀄︎';
		case 36: return '🀅';
		case 37: return '🀆';
	}
	debugger;
}

const MahjongFactory = function() {
}

MahjongFactory.sequenceBy = function(str) {
	if(!/^([wWtTsSzZ][1-9]+)*$/.test(str)) {
		return [];
	}
	let matches = str.match(/[wWtTsSzZ][1-9]+/g);
	let styles = {'t':0, 's':1, 'w':2, 'z':3};
	let mahjongs = [];
	for(let mat of matches) {
		let style = styles[mat[0].toLowerCase()];
		mahjongs.push(...mat.substr(1).split('').map(c=>new Mahjong(+c, style)));
	}
	return mahjongs;
}

MahjongFactory.allMahjongs = function(){
	/** @type {Mahjong[]} */
	let mahjongs = [];
	for(let i=0; i<34; i++) {
		let mahjong = new Mahjong(i%9+1, i/9|0);
		mahjongs.push(mahjong.clone(), mahjong.clone(), mahjong.clone(), mahjong.clone());
	}

	this.arr = mahjongs;
	/** @type {Mahjong[]} */
	this.removed = [];

	/**
	 * @param {number} index - index of element to remove.
	 * @returns {Mahjong} 
	 */
	this.remove = function(index) {
		return this.removed.push(this.arr.splice(index, 1)[0]);
	}
	/**
	 * @returns {undefined}
	 */
	this.recurse = function() {
		this.arr.push(...this.removed);
		this.removed = [];
	}

	return this;
};

