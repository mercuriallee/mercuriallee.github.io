var map=
`J L N O K F L G
M D E A K B I K
I O J L L M B P
P C G J F D O E
I N F O N M D H
I N D K J E C G
A M H B E P C H
C F A A B H P G`;

/*
 * 0 1 2 3
 * 1
 * 2
 * 3
 *
 */
let g = map.split('\n').map(r=>r.split(' '));

function linkUp(map) {
	let g = map.split('\n').map(r=>r.split(' '));
	let dict = {};
	for(let r=0; r<g.length; r++) {
		for(let c=0; c<g[r].length; c++) {
			let ch = g[r][c];
			if(dict[ch] == null) {
				dict[ch] = [[r,c]];
			} else {
				dict[ch].push([r,c]);
			}
		}
	}

	return recursivelyLink(g, dict);
}

function charPriority(ch, g, dict) {
	let vs = dict[ch];
	for(let i=0; i<vs.length-1; i++) {
		for(let j=i+1; j<vs.length; j++) {
			let a = vs[i], b = vs[j];
			if(a[0]==b[0] && Math.abs(a[1]-b[1])==1 || a[1] == b[1] && Math.abs(a[0]-b[0])==1) {
				return 1;
			}
		}
	}
	let priority = 1;
	for(let [r,c] of dict[ch]) {
		priority *= [[-1,0],[1,0],[0,-1],[0,1],[1,1],[1,-1],[-1,1],[-1,-1]].reduce((s,[i,j])=> s+((g[r+i]||[])[c+j] != null), 1);
	}
	return priority;
}

function recursivelyLink(g, dict, restLinks) {
	if(restLinks == null) {
		restLinks = g.length * g[0].length / 2;
	}
	if(restLinks == 0) return [];
	let sortedKeys = Object.keys(dict).filter(k=>dict[k].length!=0).sort((a,b) => charPriority(a, g, dict)-charPriority(b, g, dict));
	let cb = function(){};
	for(let ch of sortedKeys) {
		let vs = dict[ch];
		for(let i=0; i<vs.length-1; i++) {
			for(let j=i+1; j<vs.length; j++) {
				if(linkable(g, vs[i], vs[j])) {
					let backup = {vi:vs[i].slice(), vj:vs[j].slice(), ch:ch};
					cb = function() {
						let {vi, vj, ch} = backup;
						g[vi[0]][vi[1]] = ch;
						g[vj[0]][vj[1]] = ch;
						vs.splice(i, 0, vi);
						vs.splice(j, 0, vj);
					}
					g[vs[i][0]][vs[i][1]] = null;
					g[vs[j][0]][vs[j][1]] = null;
					vs.splice(j, 1);
					vs.splice(i, 1);

					let rest = recursivelyLink(g, dict, restLinks-1);
					if(rest) {
						return [[backup.vi, backup.vj], ...rest];
					} else {
						cb();
					}
				}
			}
		}
	}
	return false;
}

function linear(g, v1, v2, across=false) {
	if(v1[0] == v2[0]) {
		let [l,r] = v1[1] < v2[1] ? [v1[1], v2[1]] : [v2[1], v1[1]];
		return (g[v1[0]] || []).every((e,i)=> i<l || i>r || i==v1[1] || i==v2[1] && !across || !e) ? [v1, v2] : false;
	}
	else if(v1[1] == v2[1]) {
		let [t,b] = v1[0] < v2[0] ? [v1[0], v2[0]] : [v2[0], v1[0]];
		let col = v1[1];
		return g.map(r=>r[col]).every((e,i)=> i<t || i>b || i==v1[0] || i==v2[0] && !across || !e) ? [v1, v2] : false;
	}
	return false;
}

function linkable(g, v1, v2) {
	if(linear(g, v1, v2)) {
		return [v1, v2];
	}

	for(let r=-1; r<=g.length; r++) {
		let m1 = [r, v1[1]], m2 = [r, v2[1]];
		if(linear(g, v1, m1, true) && linear(g, m1, m2, true) && linear(g, m2, v2)) {
			return [v1, m1, m2, v2];
		}
	}
	for(let c=-1; c<=g[0].length; c++) {
		let m1 = [v1[0], c], m2 = [v2[0], c];
		if(linear(g, v1, m1, true) && linear(g, m1, m2, true) && linear(g, m2, v2)) {
			return [v1, m1, m2, v2];
		}
	}
	return false;
}

console.log(linkable(g, [2,2], [3,3]));
console.log('-----------------');

console.log(linkUp(map));
console.log(map);
