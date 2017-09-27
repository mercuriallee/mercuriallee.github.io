const N = 7;

function clue_affect_index(num, n=N) {
	switch (num) {
		case 0: return [0,7,14,21,28,35,42];
		case 1: return [1,8,15,22,29,36,43];
		case 2: return [2,9,16,23,30,37,44];
		case 3: return [3,10,17,24,31,38,45];
		case 4: return [4,11,18,25,32,39,46];
		case 5: return [5,12,19,26,33,40,47];
		case 6: return [6,13,20,27,34,41,48];
		case 7: return [6,5,4,3,2,1,0];
		case 8: return [13,12,11,10,9,8,7];
		case 9: return [20,19,18,17,16,15,14];
		case 10: return [27,26,25,24,23,22,21];
		case 11: return [34,33,32,31,30,29,28];
		case 12: return [41,40,39,38,37,36,35];
		case 13: return [48,47,46,45,44,43,42];
		case 14: return [48,41,34,27,20,13,6];
		case 15: return [47,40,33,26,19,12,5];
		case 16: return [46,39,32,25,18,11,4];
		case 17: return [45,38,31,24,17,10,3];
		case 18: return [44,37,30,23,16,9,2];
		case 19: return [43,36,29,22,15,8,1];
		case 20: return [42,35,28,21,14,7,0];
		case 21: return [42,43,44,45,46,47,48];
		case 22: return [35,36,37,38,39,40,41];
		case 23: return [28,29,30,31,32,33,34];
		case 24: return [21,22,23,24,25,26,27];
		case 25: return [14,15,16,17,18,19,20];
		case 26: return [7,8,9,10,11,12,13];
		case 27: return [0,1,2,3,4,5,6];
	}
}

function relatedUnits(index, n=N) {
	switch(index) {
		case 0: return [7,14,21,28,35,42,1,2,3,4,5,6];
		case 1: return [8,15,22,29,36,43,0,2,3,4,5,6];
		case 2: return [9,16,23,30,37,44,0,1,3,4,5,6];
		case 3: return [10,17,24,31,38,45,0,1,2,4,5,6];
		case 4: return [11,18,25,32,39,46,0,1,2,3,5,6];
		case 5: return [12,19,26,33,40,47,0,1,2,3,4,6];
		case 6: return [13,20,27,34,41,48,0,1,2,3,4,5];
		case 7: return [0,14,21,28,35,42,8,9,10,11,12,13];
		case 8: return [1,15,22,29,36,43,7,9,10,11,12,13];
		case 9: return [2,16,23,30,37,44,7,8,10,11,12,13];
		case 10: return [3,17,24,31,38,45,7,8,9,11,12,13];
		case 11: return [4,18,25,32,39,46,7,8,9,10,12,13];
		case 12: return [5,19,26,33,40,47,7,8,9,10,11,13];
		case 13: return [6,20,27,34,41,48,7,8,9,10,11,12];
		case 14: return [0,7,21,28,35,42,15,16,17,18,19,20];
		case 15: return [1,8,22,29,36,43,14,16,17,18,19,20];
		case 16: return [2,9,23,30,37,44,14,15,17,18,19,20];
		case 17: return [3,10,24,31,38,45,14,15,16,18,19,20];
		case 18: return [4,11,25,32,39,46,14,15,16,17,19,20];
		case 19: return [5,12,26,33,40,47,14,15,16,17,18,20];
		case 20: return [6,13,27,34,41,48,14,15,16,17,18,19];
		case 21: return [0,7,14,28,35,42,22,23,24,25,26,27];
		case 22: return [1,8,15,29,36,43,21,23,24,25,26,27];
		case 23: return [2,9,16,30,37,44,21,22,24,25,26,27];
		case 24: return [3,10,17,31,38,45,21,22,23,25,26,27];
		case 25: return [4,11,18,32,39,46,21,22,23,24,26,27];
		case 26: return [5,12,19,33,40,47,21,22,23,24,25,27];
		case 27: return [6,13,20,34,41,48,21,22,23,24,25,26];
		case 28: return [0,7,14,21,35,42,29,30,31,32,33,34];
		case 29: return [1,8,15,22,36,43,28,30,31,32,33,34];
		case 30: return [2,9,16,23,37,44,28,29,31,32,33,34];
		case 31: return [3,10,17,24,38,45,28,29,30,32,33,34];
		case 32: return [4,11,18,25,39,46,28,29,30,31,33,34];
		case 33: return [5,12,19,26,40,47,28,29,30,31,32,34];
		case 34: return [6,13,20,27,41,48,28,29,30,31,32,33];
		case 35: return [0,7,14,21,28,42,36,37,38,39,40,41];
		case 36: return [1,8,15,22,29,43,35,37,38,39,40,41];
		case 37: return [2,9,16,23,30,44,35,36,38,39,40,41];
		case 38: return [3,10,17,24,31,45,35,36,37,39,40,41];
		case 39: return [4,11,18,25,32,46,35,36,37,38,40,41];
		case 40: return [5,12,19,26,33,47,35,36,37,38,39,41];
		case 41: return [6,13,20,27,34,48,35,36,37,38,39,40];
		case 42: return [0,7,14,21,28,35,43,44,45,46,47,48];
		case 43: return [1,8,15,22,29,36,42,44,45,46,47,48];
		case 44: return [2,9,16,23,30,37,42,43,45,46,47,48];
		case 45: return [3,10,17,24,31,38,42,43,44,46,47,48];
		case 46: return [4,11,18,25,32,39,42,43,44,45,47,48];
		case 47: return [5,12,19,26,33,40,42,43,44,45,46,48];
		case 48: return [6,13,20,27,34,41,42,43,44,45,46,47];
	}
}

function repeatedValue(index, matrix, rewrite_times, n) {
	let relateds = relatedUnits(index, n);
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
			let union_set = new Set(clue_affect_index(clues_with_priority[i].index, n));
			clue_affect_index(clues_with_priority[j].index, n).forEach(e=>union_set.add(e));
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
			let affect_indices = clue_affect_index(index, n);
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

var clues_7_0 = [7,0,0,0,2,2,3, 0,0,3,0,0,0,0, 3,0,3,0,0,5,0, 0,0,0,0,5,0,4];
var clues_7_1 = [0,2,3,0,2,0,0, 5,0,4,5,0,4,0, 0,4,2,0,0,0,6, 5,2,2,2,2,4,1];

function test() {
	return solvePuzzle(clues_7_1,7);
}
