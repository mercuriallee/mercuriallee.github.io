var Skyscrapers = {
	allCombination(n) {
		const build = arr => {
			if(arr.length == 1) return [[arr[0]]];
			let refs = [];
			for(let i in arr) {
				// typeof(i) == 'string ' - -
				if(i==1 && arr.join('') == '234') debugger;
				build([...arr.slice(0, i), ...arr.slice(+i+1)]).forEach(seq=>refs.push([arr[i], ...seq]));
			}
			return refs;
		};
		let arr = [...Array(n)].map((_,i)=>i+1);
		return build(arr);
	},
	solve(clues) {
		let n = clues.length / 4;
		if(n|0 !== n) throw new Error("Invalid clues.");
		let combinations = this.allCombination(n);
	}
}

if(this.window == null) {
	module.exports = Skyscrapers;
}

