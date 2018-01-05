
/**
 * C(X,x)C(Y,y)C(Z,z)C(20-X-Y-Z,w);
 * x from 1 to X, y from 1 to Y, ...
 * x+y+z+w=5;
 *
 * @param {number[]} counts - Array of sepecified cards' length;
 * @param {number}  capacity - HandDeck count.
 * @returns {number|null}
 */

function solve(counts, capacity) {
	if(capacity < 0) {
		return null;
	}
	if(counts.length == 0) {
		return 1;
	}
	let sumOfProducts = 0, curCount = counts.shift();
	for(let i=1; i<=curCount; i++) {
		let restSolution = solve(counts.slice(), capacity-i);
		if(restSolution != null) {
			sumOfProducts += restSolution * C(curCount, i);
		}
	}
	return sumOfProducts;
}

function C(n, m) {
	let product = 1;
	for(let i=n, j=m; j>0; i--,j--) {
		product *= i/j;
	}
	return Math.round(product);
}

let counts = [5,4,4];
console.log(solve(counts.concat(20-counts.reduce((a,b)=>a+b)), 5) / C(20,5));
