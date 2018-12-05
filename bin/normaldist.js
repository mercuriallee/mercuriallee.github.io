const NormalDist = (function() {
	function cdf(x) {
		/*
		 * CDF(x) = 1/2 + 1/sqrt(2*PI) * exp(-x**2/2) * (x + x**3/3 + x**5/3/5+....)
		 */

		//const multiplier1 = 1/Math.sqrt(2*Math.PI) * Math.exp(-0.5 * x*x);
		const Smallest = math.pow(math.bignumber(10), -63);
		const PI = math.bignumber('3.14159265358979323842624338327950288');
		const multiplier1 = math.multiply(math.divide(math.bignumber(1), math.sqrt(math.multiply(math.bignumber(2), PI))), math.exp(math.bignumber(-0.5*x*x)));
		let addlet = math.bignumber(0), 
			i=1,
			multiplier2=math.bignumber(1), 
			cumulant=math.bignumber(1/2);
		do {
			multiplier2 = math.divide(multiplier2, 2*i-1);
			addlet      = math.multiply(multiplier1, math.multiply(multiplier2, math.pow(math.bignumber(x), 2*i-1)) );
			cumulant    = math.add(cumulant, addlet);
			i++;
		} while(math.isPositive(math.subtract(math.abs(addlet), Smallest)));

		return cumulant.toString();
	}

	return {cdf};
})();


