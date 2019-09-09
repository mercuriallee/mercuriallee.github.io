function lastDigit(as){
    return as.reduceRight((a,e,i)=>{
      let base = i==0 ? e % 10: 
			e < 4 ? e : e % 4 + 4;
      let exp = a < 4 ? a : a % 4 + 4;
      return Math.pow(base, exp);
    }, 1) % 10;
}

console.log(lastDigit([2,2,1,2,0,2,0,0,2,2]));
