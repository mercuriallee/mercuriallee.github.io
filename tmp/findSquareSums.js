const N = 1000;
function sqrs(arr) {
	arr.sort((a,b)=>(+a)-b);
	let g = [];
	for(let i=0; i<arr.length; i++) {
		let a = arr[i];
		g[a] = [];
		g[a].len = 0;
		for(let j=0; j<arr.length; j++) {
			let b = arr[j];
			if((a+b)**0.5%1==0 && a!=b) {
				g[a][b] = true;
				g[a].len++;
			} else {
				g[a][b] = false;
			}
		}
	}
	let seq = [];
	halmiton(g, arr.length, seq);
	return seq;
}

function halmiton(graph, v, seq=[], heads, restoreCB=function(){}) {
	let restore = restoreCB;
	heads = heads || graph.reduce((ar,e,i)=>(e.len!=null&&ar.push(i),ar), []);
	heads.sort((a,b)=>graph[a].len-graph[b].len);
	for(let head of heads)  {

		let continuous = graph[head].reduce((a,e,i)=>(e&&a.push(i),a), []);
		// no continuous, then restore.
		if(continuous.length == 0) {
			if(v!=1) {
				continue;
			} else {
				seq.push(head);
				return true;
			}
		}
		seq.push(head);

		//backup.
		let backup = {continuous: continuous.slice(), head: head};
		restoreCB = function() {
			let {continuous: c, head: h} = backup;
			c.forEach(e=>{
				graph[h][e] = true;
				graph[e][h] = true;
				graph[e].len++;
			});
			graph[h].len = c.length;
		};
		// delete head node.
		continuous.forEach(e=>{
			graph[head][e]=false;
			graph[e][head]=false;
			graph[e].len--;
		});
		graph[head].len = undefined;

		let restRes = halmiton(graph, v-1, seq, continuous, restoreCB);
		if(restRes) {
			return true;
		}  else {
			seq.pop();
		}
	}
	restore();
	return false;

}

let start = Date.now();
for(let i=30; i<N; i++) {
	console.log(i);
	let arr = Array(i).fill().map((_,i) => i+1);
	let h = sqrs(arr);
	if(!h.length) {
		console.log(i+' : Not Found.');
	} 
}

let end = Date.now();

console.log(`Cost ${(end-start)/1000}s`);
