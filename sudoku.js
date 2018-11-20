const Sudoku = function() {
	function sudoku(puzzle) {
	  if (typeof puzzle == 'string') {
		puzzle = puzzle.split(/\s+/);
		if(puzzle.length >9 || puzzle.some(row => row.length > 9)) throw 'Puzzle Invalid.';
		puzzle = puzzle.map(row_str => (row_str+'0'.repeat(9-(row_str.length))).split('').
							map(str=>+str));
	  }
	  
	  var optionsMatrix = puzzle.map(row => row.map(e => {
		 return e == 0 ? [1,2,3,4,5,6,7,8,9] : [e];
	  }));
	  
	  return solve(optionsMatrix);
	}

	function remove_arr(arr1, arr2){
	 var changed = false;
	 for(var e_remove of arr2) {
		var index_remove = arr1.indexOf(e_remove);
		if (index_remove != -1)  {
		  arr1.splice(arr1.indexOf(e_remove), 1); 
		  changed = true;
		}
	 }
	 return changed;
	};

	function solve(optionsMatrix) {
	   var updatedMatrix = updateEnumMatrix(optionsMatrix);
	   if(win(updatedMatrix)) return updatedMatrix.map(row => row.map(options => options[0]));
	   
	   var optionsToIterate = (function() {
		 for(var row of updatedMatrix) {
		   for(var options of row) {
			 if(options.length > 1) return options;
		   }
		 }
	   })()
	   for (var option of optionsToIterate.slice()) {
		  optionsToIterate.splice(0, optionsToIterate.length, option);
		  var result = solve(updatedMatrix);
		  if(result.length === 9) return result;
	   }
	   
	   return 0;
	}

	function updateEnumMatrix(optionsMatrix) {
	   // operation should not change uniqe optionsMatrix.
	   optionsMatrix = deepCopy(optionsMatrix);
	   var changed = false;

	   var replace = ((arr1, arr2) =>{
		 return Array.prototype.splice.apply(arr1, [0,arr1.length].concat(arr2))
	   });
	   
	   do{
		 changed = false;
		 for(var constraint of constraints(optionsMatrix)) {
			var apprStat = {};  //{index: {ref, length, count}}
			  for(var options of constraint) {
				var key = options.toString();
				if(apprStat[key] === undefined) {
				  apprStat[key] = {refs: [options], length: options.length, count: 1};
				  continue;
				}
				apprStat[key].refs.push(options);
				apprStat[key].count++;
			  }
			  for(key of Object.keys(apprStat)) {
				var apprInfo = apprStat[key];
				if(apprInfo.length < apprInfo.count) {
					return [];
				}
				if(apprInfo.length == apprInfo.count) {
				   for(var e of constraint) {
					  if (apprInfo.refs.indexOf(e) === -1) {
						changed = changed | remove_arr(e, apprInfo.refs[0]);
					  }
				   }
				}
			  }
			}
	   }while(changed)
	   return optionsMatrix;
	}

	function win(optionsMatrix) {
	   return optionsMatrix.every(row => row.every(options => options.length == 1));
	}

	function wrong(optionsMatrix) {
	   return optionsMatrix.length === 0;
	}

	function deepCopy(object, old_new_dict) {
	  if(old_new_dict == undefined) old_new_dict = {keys: []};
	  if(Object.prototype.toString.apply(object) == '[object Number]') return object;
	  var result = object;
	  var key = old_new_dict.keys.indexOf(object);
	  if (key == -1) key = old_new_dict.keys.length;
	  else return old_new_dict[key];
	  do {
		 if (typeof object == 'object' && 
			 Object.prototype.toString.apply(object) == '[object Array]') {
			 result = object.map(e => deepCopy(e, old_new_dict));
			 old_new_dict[key] = result;
			 old_new_dict.keys.push(key);
			 break;
		 }
		 if (typeof object == 'object') {
			 var obj_copy = {};
			 Object.keys(object).forEach(key => obj_copy[key] = 
						deepCopy(object[key]), old_new_dict);
			 result = obj_copy;
			 old_new_dict[key] = obj_copy;
			 old_new_dict.keys.push(key);
			 break;
		 }
	  } while(0);
	  return result;
	}

	function constraints(optionsMatrix) {
	   var rows = optionsMatrix.slice(0);
	   var cols = [0,1,2,3,4,5,6,7,8].map(col => optionsMatrix.map(row => row[col]));
	   var blocks = [[0,0], [0,3], [0,6], [3,0], [3,3], [3,6], [6,0], [6,3], [6,6]].map(
			  ([row, col]) => {return [optionsMatrix[row][col], optionsMatrix[row][col+1], optionsMatrix[row][col+2],
			  optionsMatrix[row+1][col], optionsMatrix[row+1][col+1], optionsMatrix[row+1][col+2],
			  optionsMatrix[row+2][col], optionsMatrix[row+2][col+1], optionsMatrix[row+2][col+2] ]});
		return rows.concat(cols).concat(blocks);
	}
	
	return {
		solve: sudoku
	}
}();
