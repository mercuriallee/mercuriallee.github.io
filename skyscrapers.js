const Skyscrapers = {};

Skyscrapers.solvePuzzle = (function(){

	const N = 7;

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

	function clue_affect_index_slowly(num, n=N) {
		switch(parseInt(num / n)) {
			case 0: return [...Array(n)].map((_,i)=>i*n+num);
			case 1: return [...Array(n)].map((_,i)=>(num%n)*n+(n-1-i));
			case 2: return [...Array(n)].map((_,i)=>(n-i-1)*n+(n-1-num%n));
			case 3: return [...Array(n)].map((_,i)=>(n-1-num%n)*n+i);
		}
	}

	let clue_affect_index = memorize(clue_affect_index_slowly);

	function cluePriorityAnalysis(clues,  n=N) {
		let clues_with_priority = clues.map((e,i)=>{return {value: e, index: i}}).filter(e=>e.value||0);
		let dual_clues = [];
		search_dual_clues_loop: for(let i=0; i<clues_with_priority.length - 1;i++) {
			for(let j=i+1; j< clues_with_priority.length; j++) {
				let union_set = new Set(clue_affect_index(clues_with_priority[i].index, n));
				clue_affect_index(clues_with_priority[j].index, n).forEach(e=>union_set.add(e));
				if([...union_set].length === n){
					dual_clues.push([i,j]);
					continue search_dual_clues_loop;
				}
			}
		}
		dual_clues = dual_clues.reduce((a,e)=>a.concat(e.sort((i,j)=>clues_with_priority[j].value - clues_with_priority[i].value)),[]);
		let sorted_clue_with_priority = [];
		let last, max_pos=0, max=0, priority=0 , i=0;
		while(true) {
			if(clues_with_priority.length === sorted_clue_with_priority.length) {break}
			if(i === clues_with_priority.length) {
				sorted_clue_with_priority.push(clues_with_priority[max_pos]);
				clues_with_priority[max_pos] = null;
				last = max_pos;
				max=0;max_pos=0;priority=0;i=0;
				continue;
			}
			if(clues_with_priority[i] == null) {
				i++;
				continue;
			}
			let index_of_dual = dual_clues.indexOf(i);
			priority = 0;
			if(index_of_dual !== -1 && last === (index_of_dual%2==0 ? dual_clues[index_of_dual+1] : dual_clues[index_of_dual-1])) {
				priority += 256;
			} 
			if(clues_with_priority[i].value === N ) {
				priority += 96;
			} 
			if(clues_with_priority[i].value === N-1) {
				priority += 64;
			}
			if(Math.abs(clues_with_priority[i].index % n -  parseInt(n/2))<2) {
				priority += 20;
			}
			if(clues_with_priority[i].value === N-2) {
				priority += 30;
			}
			if(index_of_dual !== -1) {
				priority += 32 + clues_with_priority[i].value;
			}
			priority += clues_with_priority[i].value || 0; 
			if(priority > max) {
				max = priority;
				max_pos = i;
			}
			i++;
		}
		return sorted_clue_with_priority;
	}

	function solvePuzzle(clues, n=N) {
		let handled_units = new Set([]);
		clues_with_priority = cluePriorityAnalysis(clues, n);
		clues_with_priority.forEach((e,i)=>e.priority = [10*N-i]);
		for(let clue_obj of clues_with_priority) {
			let affect_poses = clue_affect_index(clue_obj.index, n);
			clue_obj.poses = affect_poses;
			affect_poses.forEach(e=>handled_units.add(e));
		}

		let rest = new Set([...Array(n*n)].map((_,i)=>i));
		handled_units.forEach(e=>rest.delete(e));

		clues_with_priority.push({index: null, value: -1, priority: [-1], poses: [...rest]});

		let matrix = [...Array(n*n)].map(_=>0);
		let rewrite_times = [...Array(n*n)].map(_=>0);
		let clue_index = 0, seen = 0, highest = 0, unit_index = 0, success = 0, was_rejected = false;
		let history_data = [[0,0]];
		let row_counts = [...Array(n)].map(_=>new Uint8Array(8));
		let col_counts = [...Array(n)].map(_=>new Uint8Array(8));

		let reject_back = function() {
			unit_index -= 1;
			was_rejected = true;
			history_data.pop();
			[seen, highest] = history_data[history_data.length-1] || [0, 0];
		}

		clue_loop: while(true) {
			if(clue_index === clues_with_priority.length) {break;}
			let cur_clue = clues_with_priority[clue_index];
			unit_loop: while(true) {
				if(unit_index >= cur_clue.poses.length) {
					if(cur_clue.value === -1) {
						success = true;
						break clue_loop;
					}
					if(seen != cur_clue.value) {
						reject_back();
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
					continue clue_loop;
				}
				let pos_of_matrix = cur_clue.poses[unit_index];
				let height = matrix[pos_of_matrix];
				rewrite_times[pos_of_matrix] = rewrite_times[pos_of_matrix] - was_rejected;
				if(rewrite_times[pos_of_matrix]) {
					if(was_rejected) {
						reject_back();
						continue unit_loop;
					}
					if(height > highest) {
						if(cur_clue.value !== -1 && (seen+1 > cur_clue.value || (seen+n-unit_index)<cur_clue.value)) {
							reject_back();
							continue unit_loop;
						} else {
							highest = height;
							seen += 1;
							rewrite_times[pos_of_matrix] += 1;
							history_data.push([seen, highest]);
						}
					}
					else {
						if(cur_clue.value != -1 && (seen+n-1-unit_index)<cur_clue.value) {
							reject_back();
							continue unit_loop;
						}
						history_data.push([seen,highest]);
						rewrite_times[pos_of_matrix] += 1;
					}
				} else {
					let [row,col] = [parseInt(pos_of_matrix / n), pos_of_matrix % n];
					if(was_rejected) {
						row_counts[row][height] -= 1;
						col_counts[col][height] -= 1;
					}
					was_rejected = false;
					//let exists = existsValues(pos_of_matrix, matrix, rewrite_times, n);
					testValue: while(true) {
						height = height + 1;
						matrix[pos_of_matrix] = height;
						if(height > n || height > n+1+unit_index-cur_clue.value) {
							reject_back();
							matrix[pos_of_matrix] = 0;
							continue unit_loop;
						}
						if(row_counts[row][height] || col_counts[col][height]) {
							continue testValue;
						}
						if(height> highest) {
							if(cur_clue.value !== -1 && (seen+1 > cur_clue.value || (seen+n-unit_index)<cur_clue.value)) {
								continue testValue;
							}
							highest = height;
							seen += 1;
						} else if (cur_clue.value !== -1 && (seen-1+n-unit_index)<cur_clue.value) {
							continue testValue;
						}
						rewrite_times[pos_of_matrix] += 1;
						row_counts[row][height] += 1;
						col_counts[col][height] += 1;
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

	return solvePuzzle;
})();

Skyscrapers.test = function() {
	let clues_7_0 = [7,0,0,0,2,2,3, 0,0,3,0,0,0,0, 3,0,3,0,0,5,0, 0,0,0,0,5,0,4];
	let clues_7_1 = [0,2,3,0,2,0,0, 5,0,4,5,0,4,0, 0,4,2,0,0,0,6, 5,2,2,2,2,4,1];
	let clues_7_2 = [0,2,3,0,2,0,0, 5,0,4,5,0,4,0, 0,4,2,0,0,0,6, 0,0,0,0,0,0,0];

	function test() {
		let solvePuzzle = Skyscrapers.solvePuzzle;
		return [
			solvePuzzle(clues_7_0, 7),
			solvePuzzle(clues_7_1, 7),
			solvePuzzle(clues_7_2, 7)
		]
	}

	let start = +new Date;
	let result = test();
	result = result.reduce((str,arr)=>str+arr.reduce((str1,row)=>str1+row.join(',')+'\n','')+'\n', '');
	let end = +new Date;
	 
	console.log('Result: \n'+result);
	console.log('Cost: '+(end-start)+'ms');
	return result;
}


//If not running in browser. Other words, if run this script as Main script;
if(!this.window)  {
	Skyscrapers.test();
}
