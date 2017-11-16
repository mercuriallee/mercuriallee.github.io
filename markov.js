function markov_E(start, end, p) {
	if(p == 0.5) {
		if(end < start) {return 0}
		return [...Array(end - start)].reduce((s,_,i)=>s+2*(start+i+1), 0);
	} else {
		const a=start, b=end, q=1-p;
		return (1/(q-p))*(((q/p)**(a+1)-(q/p)**(b+1))/(1-q/p)-(b-a));
	}
}

if(!window) {
	exports.markov_E = markov_E;
}
