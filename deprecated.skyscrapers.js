const N = 6;

function memorize(fn, obj) {
	let cache = {};
	return function() {
		let key = JSON.stringify(Array.prototype.slice.apply(arguments));
		if(!cache[key]) {
			cache[key] = fn.apply(obj, arguments);
		}
		return cache[key];
	}
}
function clue_affect_index(num, n=N) {
	switch(parseInt(num / n)) {
		case 0: return [...Array(n)].map((_,i)=>i*n+num);
		case 1: return [...Array(n)].map((_,i)=>(num%n)*n+(n-1-i));
		case 2: return [...Array(n)].map((_,i)=>(n-i-1)*n+(n-1-num%n));
		case 3: return [...Array(n)].map((_,i)=>(n-1-num%n)*n+i);
	}
}

function relatedUnits(index, n=N) {
	return [...Array(n)].map((_,i)=>n*i+index%n).concat([...Array(n)].map((_,i)=>n*parseInt(index/n)+i)).filter(e=>e!=index);
}

let memorized_clue_affect_index = memorize(clue_affect_index);
let memorized_relatedUnits = memorize(relatedUnits);

function repeatedValue(index, matrix, rewrite_times, n) {
	let relateds = memorized_relatedUnits(index, n);
	let next_index = 0;
	while(true) {
		let i = relateds[next_index];
		if(rewrite_times[i] && matrix[i] === matrix[index]) {
			return true;
		}
		next_index += 1;
		if(next_index === relateds.length) {break;}
	}
	return false;
}

function solvePuzzle(clues, n=N) {
	let handled_units = new Set([]);
	let stack = [];
	let clue_nums = [];
	let clues_with_priority = clues.map((e,i)=>{return {value: e, index: i}})
		.filter(e=>e.value||0).sort((a,b)=>b.value-a.value);
	i_loop: for(let i=0; i<clues_with_priority.length - 1;) {
		for(let j=i+1; j< clues_with_priority.length; j++) {
			let union_set = new Set(memorized_clue_affect_index(clues_with_priority[i].index, n));
			memorized_clue_affect_index(clues_with_priority[j].index, n).forEach(e=>union_set.add(e));
			if([...union_set].length === n && j-i!=1){
				[clues_with_priority[j], clues_with_priority[i+1]] = [clues_with_priority[i+1],clues_with_priority[j]];
				i=i+2;
				continue i_loop;
			}
		}
		i=i+1;
	}
	for(let {index, value} of clues_with_priority) {
		if(clues[index]) {
			let affect_indices = memorized_clue_affect_index(index, n);
			clue_nums.push(value);
			affect_indices.forEach(e=>handled_units.add(e));
			stack.push(affect_indices);
		}
	}

	let rest = new Set([...Array(n*n)].map((_,i)=>i));
	handled_units.forEach(e=>rest.delete(e));
	rest = [...rest];

	clue_nums.push(-1);
	stack.push(rest);

	let matrix = [...Array(n*n)].map(_=>0);
	let rewrite_times = [...Array(n*n)].map(_=>0);
	let clue_index = 0, seen = 0, highest = 0, unit_index = 0, success = 0, reject_last = false;
	let history_data = [[0,0]];
	clue_loop: while(true) {
		console.log(clue_index);
		if(clue_index >= clue_nums.length) {break;}
		unit_loop: while(true) {
			if(unit_index >= stack[clue_index].length) {
				if(clue_nums[clue_index] === -1) {
					success = true;
					break clue_loop;
				}
				if(seen != clue_nums[clue_index]) {
					unit_index -= 1;
					reject_last = true;
					history_data.pop();
					[seen, highest] = history_data[history_data.length-1];
					continue unit_loop;
				} else {
					seen = 0, highest = 0;
					history_data.pop();
					clue_index += 1;
					unit_index = 0;
					history_data.push([seen, highest]);
					continue clue_loop;
				}
			}
			if(unit_index === -1) {
				clue_index -= 1;
				if(clue_index === -1) {
					success = false;
					break clue_loop;
				}
				unit_index = n-1;
				continue unit_loop;
			}
			let pos_of_matrix = stack[clue_index][unit_index];
			rewrite_times[pos_of_matrix] = rewrite_times[pos_of_matrix] - reject_last;
			if(rewrite_times[pos_of_matrix]) {
				if(reject_last) {
					unit_index -= 1;
					history_data.pop();
					[seen, highest] = history_data[history_data.length-1];
					continue unit_loop;
				}
				if(matrix[pos_of_matrix] > highest) {
					if(clue_nums[clue_index] != -1 && seen+1 > clue_nums[clue_index]) {
						unit_index -= 1;
						history_data.pop();
						[seen, highest] = history_data[history_data.length-1];
						reject_last = true;
						continue unit_loop;
					} else {
						highest = matrix[pos_of_matrix];
						seen += 1;
						rewrite_times[pos_of_matrix] += 1;
						history_data.push([seen, highest]);
					}
				}
				else {
					history_data.push([seen,highest]);
					rewrite_times[pos_of_matrix] += 1;
				}
			} else {
				reject_last = false;
				testValue: while(true) {
					matrix[pos_of_matrix] = matrix[pos_of_matrix] + 1;
					if(matrix[pos_of_matrix] > n) {
						unit_index -= 1;
						matrix[pos_of_matrix] = 0;
						history_data.pop();
						[seen, highest] = history_data[history_data.length-1] || [0, 0];
						reject_last = true;
						continue unit_loop;
					}
					if(repeatedValue(pos_of_matrix, matrix, rewrite_times, n)) {
						continue testValue;
					}
					if(matrix[pos_of_matrix] > highest) {
						if(clue_nums[clue_index] != -1 && seen+1 > clue_nums[clue_index]) {
							continue testValue;
						}
						highest = matrix[pos_of_matrix];
						seen += 1;
					}
					rewrite_times[pos_of_matrix] += 1;
					history_data.push([seen, highest]);
					break testValue;
				}

			}
			unit_index += 1;
		}
	}
	if(!success) {
		return [[]];
	}
	else {
		let res = [];
		for(let i=0; i<n; i++) {
			res.push([]);
			for(let j=0; j<n; j++) {
				res[i][j] = matrix[i*n+j];
			}
		}
		return res;
	}
}

var clues_4 = [0, 0, 1, 2,
            		 0, 2, 0, 0,
            		 0, 3, 0, 0,
            		 0, 1, 0, 0];
var expected_6 = [[1, 3, 4, 2],
				[4, 2, 1, 3],
				[3, 4, 2, 1],
				[2, 1, 3, 4]];

console.log(solvePuzzle(clues_4, 4));

var clues_6 = [ 0, 0, 0, 2, 2, 0,
                      0, 0, 0, 6, 3, 0,
                      0, 4, 0, 0, 0, 0,
                      4, 4, 0, 3, 0, 0];
console.log(solvePuzzle(clues_6,6));

var clues_7_0 = [7,0,0,0,2,2,3, 0,0,3,0,0,0,0, 3,0,3,0,0,5,0, 0,0,0,0,5,0,4];
var clues_7_1 = [0,2,3,0,2,0,0, 5,0,4,5,0,4,0, 0,4,2,0,0,0,6, 5,2,2,2,2,4,1];
console.log(solvePuzzle(clues_7_0,7));
//console.log(solvePuzzle(clues_7_1,7));
