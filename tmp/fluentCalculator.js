var Magic = (function(){
	const Num = function(n) {
		this.n = n;
		this.valueOf = function() {
			return this.n;
		}
		this.toString = function() {
			return ''+this.n;
		}
		let self = this;
		['plus','minus','times','dividedBy'].forEach(e=>{
			Object.defineProperty(this, e, {get() {
				return new Operator(e, self.n);
			}});
			
		});
	};
	const Operator = function(op, n1, n2) {
		this.op = op;
		this.n1 = n1;
		this.n2 = n2;
		
		['zero','one','two','three','four','five','six','seven','eight','nine','ten'].forEach((e,i)=>{
			Object.defineProperty(this, e, {get:function(){
				this.n2 = i;
				switch (op) {
					case 'plus' :
						return new Num(this.n1 + this.n2);
					case 'minus' :
						return new Num(this.n1 - this.n2);
					case 'times' : 
						return new Num(this.n1 * this.n2);
					case 'dividedBy' :
						return new Num(this.n1 / this.n2);
					default:
						return null;
				}
			}});
		});
	}
	return (new Num(0)).plus;
})();
var FluentCalculator = Magic;

if(module) {
	module.exports = Magic;
}
