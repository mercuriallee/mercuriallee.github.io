const F = function(a, b, p) {
	return function(x, y) {
		this.x = x;
		this.y = y;

		this.add = function(o) {
			let [x1,y1,x2,y2] = [this.x,this.y,o.x,o.y];
			let k = (y1-y2)/(x1-x2);
			let x3 = k**2-x1-x2, y3 = k*(x1-x3)-y1;
			return this.constructor.call({},x3,y3);
		}

		Object.defineProperty(this, 'valid', {get() {
			return this.y**2 == (this.x**3 + a*this.x + b) % p;
		}});
	}
}

