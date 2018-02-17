let Fract = function(a, b){this.a=a; this.b=b};
Fract.prototype.reduction = function() {
  let a1 = this.a, b1 = this.b;
  let c = a1 % b1;
  while(c != 0) {
  	a1 = b1;
    b1 = c;
    c = a1 % b1;
  }
  return new Fract(this.a/b1, this.b/b1);
}
Fract.prototype.add = function(o) {
	let a = this.a*o.b + this.b*o.a;
  let b = this.b * o.b;
  return (new Fract(a, b)).reduction();
}
Fract.prototype.min = function(o) {
  let a = this.a * o.b - this.b * o.a;
  if(a < 0 ) {
  
  } 
  let b = this.b * o.b;
  return (new Fract(a, b)).reduction();
}
Fract.prototype.minus = Fract.prototype.min;
Fract.prototype.mul = function(o) {
	let a = this.a * o.a;
  let b = this.b * o.b;
  return (new Fract(a, b)).reduction();
}
Fract.prototype.div = function(o) {
	return this.mul(new Fract(o.b, o.a))
}
Fract.prototype.equal = function(o) {
	return this.min(o).a === 0
}

Fract.from = function(o) {
	if(typeof(o) === "number") {
		let str = o.toString();
		let dot_pos = str.indexOf('.');
		let scale = 1;
		if(dot_pos !== -1) {scale = Math.pow(10, str.length-dot_pos-1)}
		return new Fract(o*scale, scale).reduction();
	} else if(typeof(o) === "string") {
		return Fract.from(parseFloat(o));
	}
}

function equalTo24(a,b,c,d){
	let result = equalTo(24, a, b, c, d);
  if(result) {
  	return result;
  }
  return "It's not possible!";
}

function result_with_operation(i, j, operation, str, list, strs, res) {
    let new_list = list.slice(0,i).concat(list.slice(i+1, j)).concat(list.slice(j+1)).concat(operation);
    let new_strs = strs.slice(0,i).concat(strs.slice(i+1, j)).concat(strs.slice(j+1)).concat(str);
    let result = equalToRecursively(res, new_list, new_strs);
    return result;
}

function equalTo(res, ...list) {
	return equalToRecursively(Fract.from(res), list.map(e=>Fract.from(e)), list.map(e=>e+''));
}

function equalToRecursively(res, list, strs) {
	if(list.length === 1) {
  	return list[0].equal(res) ? strs[0] : false;
  }
  for(let i=0; i<list.length-1; i++) {
  	for(let j=i+1; j<list.length; j++) {
      let operation = list[i].add(list[j]);
      let str = `(${strs[i]}+${strs[j]})`;
      let result = result_with_operation(i, j, operation, str, list, strs, res);
      if(result) {
      	return result;
      }
      
      if(list[i].a*list[j].b > list[i].b*list[j].a) {
      	operation = list[i].min(list[j]);
        str = `(${strs[i]}-${strs[j]})`;
      } else {
      	operation = list[j].min(list[i]);
        str = `(${strs[j]}-${strs[i]})`;
      }
      result = result_with_operation(i, j, operation, str, list, strs, res);
      if(result) {
      	return result;
      }
      
      operation = list[i].mul(list[j]);
      str = `(${strs[i]}*${strs[j]})`;
      result = result_with_operation(i, j, operation, str, list, strs, res);
      if(result) {
      	return result;
      }
      
      if(list[j].a != 0) {
        operation = list[i].div(list[j]);
        str = `(${strs[i]}/${strs[j]})`;
        result = result_with_operation(i, j, operation, str, list, strs, res);
        if(result) {
          return result;
        }
      }
      
      if(list[i].a != 0) {
        operation = list[j].div(list[i]);
        str = `(${strs[j]}/${strs[i]})`;
        result = result_with_operation(i, j, operation, str, list, strs, res);
        if(result) {
          return result;
        }
      }
    }
  }
  return false;
}

if(this.window == null) {
	module.exports = {
		equalTo: equalTo,
		equalTo24: equalTo24
	};
}
