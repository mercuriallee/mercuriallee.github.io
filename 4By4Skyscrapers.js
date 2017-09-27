const N = 4;

function clue_affect_index(num) {
	switch(num) {
		case  0: return [0,4,8,12];
		case  1: return [1,5,9,13];
		case  2: return [2,6,10,14];
		case  3: return [3,7,11,15];
		case  4: return [3,2,1,0];
		case  5: return [7,6,5,4];
		case  6: return [11,10,9,8];
		case  7: return [15,14,13,12];
		case  8: return [15,11,7,3];
		case  9: return [14,10,6,2];
		case 10: return [13,9,5,1];
		case 11: return [12,8,4,0];
		case 12: return [12,13,14,15];
		case 13: return [8,9,10,11];
		case 14: return [4,5,6,7];
		case 15: return [0,1,2,3];
	}
}

function relatedUnits(index) {
	switch(index) {
		case  0: return [4, 8, 12, 1, 2, 3];
		case  1: return [5, 9, 13, 0, 2, 3];
		case  2: return [6, 10, 14, 0, 1, 3];
		case  3: return [7, 11, 15, 0, 1, 2];
		case  4: return [0, 8, 12, 5, 6, 7];
		case  5: return [1, 9, 13, 4, 6, 7];
		case  6: return [2, 10, 14, 4, 5, 7];
		case  7: return [3, 11, 15, 4, 5, 6];
		case  8: return [0, 4, 12, 9, 10, 11];
		case  9: return [1, 5, 13, 8, 10, 11];
		case 10: return [2, 6, 14, 8, 9, 11];
		case 11: return [3, 7, 15, 8, 9, 10];
		case 12: return [0, 4, 8, 13, 14, 15];
		case 13: return [1, 5, 9, 12, 14, 15];
		case 14: return [2, 6, 10, 12, 13, 15];
		case 15: return [3, 7, 11, 12, 13, 14];
	}
}

function repeatedValue(index, matrix, rewrite_times) {
	let relateds = relatedUnits(index);
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

function solvePuzzle(clues) {
	let handled_units = new Set([]);
	let stack = [];
	let clue_nums = [];
	let clues_with_priority = clues.map((e,i)=>{return {value: e, index: i}})
		.filter(e=>e.value||0).sort((a,b)=>b.value-a.value);
	i_loop: for(let i=0; i<clues_with_priority.length - 1;) {
		for(let j=i+1; j< clues_with_priority.length; j++) {
			let union_set = new Set(clue_affect_index(clues_with_priority[i].index));
			clue_affect_index(clues_with_priority[j].index).forEach(e=>union_set.add(e));
			if([...union_set].length === N && j-i!=1){
				[clues_with_priority[j], clues_with_priority[i+1]] = [clues_with_priority[i+1],clues_with_priority[j]];
				i=i+2;
				continue i_loop;
			}
		}
		i=i+1;
	}
	for(let {index, value} of clues_with_priority) {
		if(clues[index]) {
			let affect_indices = clue_affect_index(index);
			clue_nums.push(value);
			affect_indices.forEach(e=>handled_units.add(e));
			stack.push(affect_indices);
		}
	}

	let rest = new Set([...Array(N*N)].map((_,i)=>i));
	handled_units.forEach(e=>rest.delete(e));
	rest = [...rest];

	clue_nums.push(-1);
	stack.push(rest);

	let matrix = [...Array(N*N)].map(_=>0);
	let rewrite_times = [...Array(N*N)].map(_=>0);
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
				unit_index = N-1;
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
					if(matrix[pos_of_matrix] > N) {
						unit_index -= 1;
						matrix[pos_of_matrix] = 0;
						history_data.pop();
						[seen, highest] = history_data[history_data.length-1];
						reject_last = true;
						continue unit_loop;
					}
					if(repeatedValue(pos_of_matrix, matrix, rewrite_times)) {
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
		for(let i=0; i<N; i++) {
			res.push([]);
			for(let j=0; j<N; j++) {
				res[i][j] = matrix[i*N+j];
			}
		}
		return res;
	}
}

var clues = [0, 0, 1, 2,
            		 0, 2, 0, 0,
            		 0, 3, 0, 0,
            		 0, 1, 0, 0];
var expected = [[1, 3, 4, 2],
				[4, 2, 1, 3],
				[3, 4, 2, 1],
				[2, 1, 3, 4]];

console.log(solvePuzzle(clues));
