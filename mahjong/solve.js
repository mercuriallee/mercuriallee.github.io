function normal_check(mahjongs) {
	if(mahjongs.length % 3 !== 2) return [];
	let dict = mahjongs2dict(mahjongs);
	let vars = dict[0].num == -1 ? dict[0].count : 0;
	if(vars > 0) dict = dict.slice(1);

	let solution = normal_check_recursively(dict, vars, mahjongs.length, true) || [];
	return solution.map(nums2mahjongs);
}
function normal_check_recursively(dict, vars, rest_len, with_pair) {

	if(dict.length == 0) return [];

	// if only two mahjongs, just check if in pair.
	if(with_pair) {
		if(dict[0].count > 2) {
			let dropped = dict[0].num; dict[0].count -= 2;
			let rest_solution = normal_check_recursively(dict, vars, rest_len-2, false);
			if(rest_solution != null) {
				return [[dropped, dropped], ...rest_solution];
			} else {
				dict[0].count += 2;
			}
		}
		else if(dict[0].count > 1) {
			let dropped = dict.shift().num;
			let rest_solution = normal_check_recursively(dict, vars, rest_len-2, false);
			if(rest_solution != null) {
				return [[dropped, dropped], ...rest_solution];
			} else {
				dict.splice(0, 0, {num:dropped, count:2});
			}
		} 
		else if(vars > 0) {
			let dropped = dict.shift().num;
			let rest_solution = normal_check_recursively(dict, vars-1, rest_len-2, false);
			if(rest_solution != null) {
				return [[dropped, -1], ...rest_solution];
			} else {
				dict.splice(0, 0, {num:dropped, count:1});
			}
		}
	}

	//while-0-magic
	elp: do {
		//AAA situation
		//AAAA
		if(dict[0].count > 3) {
			let dropped = dict[0].num; dict[0].count -= 3;
			let rest_solution = normal_check_recursively(dict, vars, rest_len-3, with_pair);
			if(rest_solution != null) {
				return [[dropped, dropped, dropped], ...rest_solution];
			}
			dict[0].count += 3;
			//AAA
		} else if(dict[0].count > 2 ) {
			let dropped = dict.shift().num;
			let rest_solution = normal_check_recursively(dict, vars, rest_len-3, with_pair);
			if(rest_solution != null) {
				return [[dropped, dropped, dropped], ...rest_solution];
			}
			dict.splice(0, 0, {num:dropped, count:3});
			//AA
		} else if(dict[0].count > 1 && vars > 0) {
			let dropped = dict.shift().num;
			let rest_solution = normal_check_recursively(dict, vars-1, rest_len-3, with_pair);
			if(rest_solution != null) {
				return [[dropped, dropped, -1], ...rest_solution];
			}
			dict.splice(0, 0, {num:dropped, count:2});
			//A
		} else if(vars > 1) {
			let dropped = dict.shift().num;
			let rest_solution = normal_check_recursively(dict, vars-2, rest_len-3, with_pair);
			if(rest_solution != null) {
				return [[dropped, -1, -1], ...rest_solution];
			}
			dict.splice(0, 0, {num:dropped, count:1});
		}

		//ABC situation
		if(dict[1] && dict[2] && dict[0].num == dict[1].num-1 && dict[1].num == dict[2].num-1) {
			let comb = [dict[0].num, dict[1].num, dict[2].num];
			/** @type {{index:number, num:number}[]} */
			let drops = [];
			for(let i=2; i>-1; i--) {
				if(dict[i].count == 1){
					drops.splice(0, 0, {index:i, num:dict.splice(i, 1)[0].num});
				}
				else {
					dict[i].count--;
				}
			}
			let rest_solution = normal_check_recursively(dict, vars, rest_len-3, with_pair);
			if(rest_solution != null) {
				return [comb, ...rest_solution];
			} else {
				for(let dropped of drops) {
					dict.splice(dropped.index, 0, {num:dropped.num, count:0});
				}
				dict.slice(0,3).forEach(e=>e.count++);
			}
			//AB situation
		} else if(dict[1] && dict[0].num == dict[1].num-1 && vars > 0) {
			let comb = [dict[0].num, dict[1].num, -1];
			/** @type {{index:number, num:number}[]} */
			let drops = [];
			for(let i=1; i>-1; i--) {
				if(dict[i].count == 1) {
					drops.splice(0, 0, {index:i, num:dict.splice(i, 1)[0].num});
				}
				else {
					dict[i].count--;
				}
			}
			let rest_solution = normal_check_recursively(dict, vars-1, rest_len-3, with_pair);
			if(rest_solution != null) {
				return [comb, ...rest_solution];
			} else {
				for(let dropped of drops) {
					dict.splice(dropped.index, 0, {num:dropped.num, count:0});
				}
				dict.slice(0,2).forEach(e=>e.count++);
			}

			//AC situation
		} else if(dict[1] && dict[0].num == dict[1].num-2 && vars > 0) {
			let comb = [dict[0].num, -1, dict[1].num];
			/** @type {{index:number, num:number}[]} */
			let drops = [];
			for(let i=1; i>-1; i--) {
				if(dict[i].count == 1) {
					drops.splice(0, 0, {index:i, num:dict.splice(i, 1)[0].num});
				}
				else {
					dict[i].count--;
				}
			}
			let rest_solution = normal_check_recursively(dict, vars-1, rest_len-3, with_pair);
			if(rest_solution != null) {
				return [comb, ...rest_solution];
			} else {
				for(let dropped of drops) {
					dict.splice(dropped.index, 0, {num:dropped.num, count:0});
				}
				dict.slice(0,2).forEach(e=>e.count++);
			}
		}

		return null;
	} while(false);
}

/**
 * @param {Mahjong[]} handDeck
 * @returns {Mahjong[]};
 */
function waitingMahjong(handDeck) {
	if(handDeck.length % 3 != 1) {
		throw new Error('Wrong handDeck!');
	}
	let winDraws = [];
	for(let i=0; i<34; i++) {
		let mahjong = new Mahjong(i%9+1, i/9|0);
		if(normal_check([mahjong, ...handDeck]).length != 0) {
			winDraws.push(mahjong);
		}
	}
	return winDraws;
}

/**
 * @param {Mahjong[]} mahjongs
 * @returns {{num:number, count:number}[]} counters
 */
function mahjongs2dict(mahjongs) {
	let mapper = m => {
		if(m.num == -1) {
			return -1;
		}
		if(m.style == Mahjong.ZiStyle) {
			return m.style*20 + m.num*5;
		}
		return m.style*20 + m.num;
	}
	// sort is needed.
	let nums = mahjongs.map(mapper).sort((a,b)=>a-b);
	return nums.reduce((counters, n)=>{
		let last = counters[counters.length -1];
		if(last && last.num == n) {
			last.count++;
		} else {
			counters.push({num:n, count:1});
		}
		return counters;
	}, []);
}
function nums2mahjongs(nums) {
	let mapper = n => {
		if(n == -1) return new Mahjong(-1);
		let style = n/20>2 ? Mahjong.ZiStyle : n/20|0;
		if(style == Mahjong.ZiStyle) {
			return new Mahjong((n-Mahjong.ZiStyle*20)/5, Mahjong.ZiStyle);
		} else {
			return new Mahjong(n%20, n/20|0);
		}
	}
	return nums.map(mapper);
}

function normal_check_emoji(mahjongs) {
	return normal_check(mahjongs).map(comb=>comb.map(m=>m.toEmoji()).join(' ')).join('  ');
}

