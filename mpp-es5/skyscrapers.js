'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var Skyscrapers = {};

Skyscrapers.solvePuzzle = function () {

	var N = 7;

	function memorize(fn, obj) {
		var cache = {};
		return function () {
			var key = JSON.stringify(Array.prototype.slice.apply(arguments));
			if (!cache[key]) {
				cache[key] = fn.apply(obj, arguments);
			}
			return cache[key];
		};
	}

	function clue_affect_index_slowly(num) {
		var n = arguments.length <= 1 || arguments[1] === undefined ? N : arguments[1];

		switch (parseInt(num / n)) {
			case 0:
				return [].concat(_toConsumableArray(Array(n))).map(function (_, i) {
					return i * n + num;
				});
			case 1:
				return [].concat(_toConsumableArray(Array(n))).map(function (_, i) {
					return num % n * n + (n - 1 - i);
				});
			case 2:
				return [].concat(_toConsumableArray(Array(n))).map(function (_, i) {
					return (n - i - 1) * n + (n - 1 - num % n);
				});
			case 3:
				return [].concat(_toConsumableArray(Array(n))).map(function (_, i) {
					return (n - 1 - num % n) * n + i;
				});
		}
	}

	var clue_affect_index = memorize(clue_affect_index_slowly);

	function cluePriorityAnalysis(clues) {
		var n = arguments.length <= 1 || arguments[1] === undefined ? N : arguments[1];

		var clues_with_priority = clues.map(function (e, i) {
			return { value: e, index: i };
		}).filter(function (e) {
			return e.value || 0;
		});
		var dual_clues = [];
		search_dual_clues_loop: for (var _i = 0; _i < clues_with_priority.length - 1; _i++) {
			var _loop = function _loop(j) {
				var union_set = new Set(clue_affect_index(clues_with_priority[_i].index, n));
				clue_affect_index(clues_with_priority[j].index, n).forEach(function (e) {
					return union_set.add(e);
				});
				if ([].concat(_toConsumableArray(union_set)).length === n) {
					dual_clues.push([_i, j]);
					return 'continue|search_dual_clues_loop';
				}
			};

			for (var j = _i + 1; j < clues_with_priority.length; j++) {
				var _ret = _loop(j);

				if (_ret === 'continue|search_dual_clues_loop') continue search_dual_clues_loop;
			}
		}
		dual_clues = dual_clues.reduce(function (a, e) {
			return a.concat(e.sort(function (i, j) {
				return clues_with_priority[j].value - clues_with_priority[i].value;
			}));
		}, []);
		var sorted_clue_with_priority = [];
		var last = void 0,
		    max_pos = 0,
		    max = 0,
		    priority = 0,
		    i = 0;
		while (true) {
			if (clues_with_priority.length === sorted_clue_with_priority.length) {
				break;
			}
			if (i === clues_with_priority.length) {
				sorted_clue_with_priority.push(clues_with_priority[max_pos]);
				clues_with_priority[max_pos] = null;
				last = max_pos;
				max = 0;max_pos = 0;priority = 0;i = 0;
				continue;
			}
			if (clues_with_priority[i] == null) {
				i++;
				continue;
			}
			var index_of_dual = dual_clues.indexOf(i);
			priority = 0;
			if (index_of_dual !== -1 && last === (index_of_dual % 2 == 0 ? dual_clues[index_of_dual + 1] : dual_clues[index_of_dual - 1])) {
				priority += 256;
			}
			if (clues_with_priority[i].value === N) {
				priority += 96;
			}
			if (clues_with_priority[i].value === N - 1) {
				priority += 64;
			}
			if (Math.abs(clues_with_priority[i].index % n - parseInt(n / 2)) < 2) {
				priority += 20;
			}
			if (clues_with_priority[i].value === N - 2) {
				priority += 30;
			}
			if (index_of_dual !== -1) {
				priority += 32 + clues_with_priority[i].value;
			}
			priority += clues_with_priority[i].value || 0;
			if (priority > max) {
				max = priority;
				max_pos = i;
			}
			i++;
		}
		return sorted_clue_with_priority;
	}

	function solvePuzzle(clues) {
		var n = arguments.length <= 1 || arguments[1] === undefined ? N : arguments[1];

		var handled_units = new Set([]);
		var clues_with_priority = cluePriorityAnalysis(clues, n);
		clues_with_priority.forEach(function (e, i) {
			return e.priority = [10 * N - i];
		});
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = clues_with_priority[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var clue_obj = _step.value;

				var affect_poses = clue_affect_index(clue_obj.index, n);
				clue_obj.poses = affect_poses;
				affect_poses.forEach(function (e) {
					return handled_units.add(e);
				});
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		var rest = new Set([].concat(_toConsumableArray(Array(n * n))).map(function (_, i) {
			return i;
		}));
		handled_units.forEach(function (e) {
			return rest.delete(e);
		});

		clues_with_priority.push({ index: null, value: -1, priority: [-1], poses: [].concat(_toConsumableArray(rest)) });

		var matrix = [].concat(_toConsumableArray(Array(n * n))).map(function (_) {
			return 0;
		});
		var rewrite_times = [].concat(_toConsumableArray(Array(n * n))).map(function (_) {
			return 0;
		});
		var clue_index = 0,
		    seen = 0,
		    highest = 0,
		    unit_index = 0,
		    success = 0,
		    was_rejected = false;
		var history_data = [[0, 0]];
		var row_counts = [].concat(_toConsumableArray(Array(n))).map(function (_) {
			return new Uint8Array(8);
		});
		var col_counts = [].concat(_toConsumableArray(Array(n))).map(function (_) {
			return new Uint8Array(8);
		});

		var reject_back = function reject_back() {
			unit_index -= 1;
			was_rejected = true;
			history_data.pop();

			var _ref = history_data[history_data.length - 1] || [0, 0];

			var _ref2 = _slicedToArray(_ref, 2);

			seen = _ref2[0];
			highest = _ref2[1];
		};

		clue_loop: while (true) {
			if (clue_index === clues_with_priority.length) {
				break;
			}
			var cur_clue = clues_with_priority[clue_index];
			unit_loop: while (true) {
				if (unit_index >= cur_clue.poses.length) {
					if (cur_clue.value === -1) {
						success = true;
						break clue_loop;
					}
					if (seen != cur_clue.value) {
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
				if (unit_index === -1) {
					clue_index -= 1;
					if (clue_index === -1) {
						success = false;
						break clue_loop;
					}
					unit_index = n - 1;
					continue clue_loop;
				}
				var pos_of_matrix = cur_clue.poses[unit_index];
				var height = matrix[pos_of_matrix];
				rewrite_times[pos_of_matrix] = rewrite_times[pos_of_matrix] - was_rejected;
				if (rewrite_times[pos_of_matrix]) {
					if (was_rejected) {
						reject_back();
						continue unit_loop;
					}
					if (height > highest) {
						if (cur_clue.value !== -1 && (seen + 1 > cur_clue.value || seen + n - unit_index < cur_clue.value)) {
							reject_back();
							continue unit_loop;
						} else {
							highest = height;
							seen += 1;
							rewrite_times[pos_of_matrix] += 1;
							history_data.push([seen, highest]);
						}
					} else {
						if (cur_clue.value != -1 && seen + n - 1 - unit_index < cur_clue.value) {
							reject_back();
							continue unit_loop;
						}
						history_data.push([seen, highest]);
						rewrite_times[pos_of_matrix] += 1;
					}
				} else {
					var row = parseInt(pos_of_matrix / n);
					var col = pos_of_matrix % n;

					if (was_rejected) {
						row_counts[row][height] -= 1;
						col_counts[col][height] -= 1;
					}
					was_rejected = false;
					//let exists = existsValues(pos_of_matrix, matrix, rewrite_times, n);
					testValue: while (true) {
						height = height + 1;
						matrix[pos_of_matrix] = height;
						if (height > n || height > n + 1 + unit_index - cur_clue.value) {
							reject_back();
							matrix[pos_of_matrix] = 0;
							continue unit_loop;
						}
						if (row_counts[row][height] || col_counts[col][height]) {
							continue testValue;
						}
						if (height > highest) {
							if (cur_clue.value !== -1 && (seen + 1 > cur_clue.value || seen + n - unit_index < cur_clue.value)) {
								continue testValue;
							}
							highest = height;
							seen += 1;
						} else if (cur_clue.value !== -1 && seen - 1 + n - unit_index < cur_clue.value) {
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
		if (!success) {
			return [[]];
		} else {
			var res = [];
			for (var i = 0; i < n; i++) {
				res.push([]);
				for (var j = 0; j < n; j++) {
					res[i][j] = matrix[i * n + j];
				}
			}
			return res;
		}
	}

	return solvePuzzle;
}();

Skyscrapers.test = function () {
	var clues_7_0 = [7, 0, 0, 0, 2, 2, 3, 0, 0, 3, 0, 0, 0, 0, 3, 0, 3, 0, 0, 5, 0, 0, 0, 0, 0, 5, 0, 4];
	var clues_7_1 = [0, 2, 3, 0, 2, 0, 0, 5, 0, 4, 5, 0, 4, 0, 0, 4, 2, 0, 0, 0, 6, 5, 2, 2, 2, 2, 4, 1];
	var clues_7_2 = [0, 2, 3, 0, 2, 0, 0, 5, 0, 4, 5, 0, 4, 0, 0, 4, 2, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0];

	function test() {
		var solvePuzzle = Skyscrapers.solvePuzzle;
		return [solvePuzzle(clues_7_0, 7), solvePuzzle(clues_7_1, 7), solvePuzzle(clues_7_2, 7)];
	}

	var start = +new Date();
	var result = test();
	result = result.reduce(function (str, arr) {
		return str + arr.reduce(function (str1, row) {
			return str1 + row.join(',') + '\n';
		}, '') + '\n';
	}, '');
	var end = +new Date();

	console.log('Result: \n' + result);
	console.log('Cost: ' + (end - start) + 'ms');
	return result;
};
