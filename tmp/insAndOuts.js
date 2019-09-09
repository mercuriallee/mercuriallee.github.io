function insAndOuts(gamemap){
	console.log(gamemap);
	const I = 'I', O = 'O', E = 'E';
	let g = gamemap.split('\n').filter(r=>!/^\s*$/.test(r)).map(e=>e.trim().split(/\s+/));
	g.outline = [], g.rest = 0, visited = [], once=true;
	for(let r=0; r<g.length; r++) {
		visited[r] = [];
		for(let c=0; c<g[r].length; c++) {
			visited[r][c] = false;
			if(g[r][c] == I) {
				g.rest++;
				if(once) {
					once = false;
					visited[r][c] = true;
					g.rest--;
					[[-1,0], [1,0], [0,-1], [0,1]].forEach(([x,y]) => {
						if(g[x+r] != null && g[x+r][y+c] != null && g[x+r][y+c] != O) {
							g.outline.push([x+r, y+c]);
						}
					});
				}
			}
		}
	}

	let presolve = findMinTree(g, {I, O, E});
	debugger;

	//return findMaxTree(g, {include: I, exclude: O, empty: E, visited: visited});
	return true;
}

const Vertex = function(value, countries, position) {
	this.value = value;
	this.countries = countries;
	this.position = position;
	this.deinitCbs = [];
}
Vertex.prototype.deinit = function() {
	for(let fn of this.deinitCbs) {
		fn();
	}
	this.deinitCbs = [];
}
const Country = function(flag) {
	this.flag = flag;
	this.vertices = [];
}

const World = {countries: [], map: []};

function initWorldMap(g, {I, O, E}) {
	let flag = 1;
	for(let r=0; r<g.length; r++) {
		World.map[r] = [];
		for(let c=0; c<g[r].length; c++) {
			let v = g[r][c];
			if(v == I) {
				let country = new Country(flag);
				World.map[r][c] = new Vertex(v, [country], [r,c]);
				country.vertices.push(World.map[r][c]);
				World.countries[flag] = country;
				flag++;
			} else {
				World.map[r][c] = new Vertex(v, [], [r,c]);
			}
		}
	}
	for(let country of World.countries) {
		for(let vertex of country.vertices) {
			let [r,c] = vertex.position;
			[-1,0,1].forEach(x=>[-1,0,1].forEach(y=> {
				if(g[r+x] && g[r+x][c+y] == E) {
					World.map[r+x][c+y].countries.push(country);
					country.push(World.map[r+x][c+y]);
				}
			}));
		}
	}
}

/*
/*
 * IVertex {
 *	 [x,y]
 *	 neighbors: {group: Edge}
 * }
 *
 * EVertex {
 *	presentEdges: [Edge];
 *	remove()
 * }
 *
 * Edge {
 *	[IVertex, EVertices, IVertex]
 *	IVertex1
 *	IVertex2
 *	remove()
 * }


function initialize(g, {I,O,E}={}) {
	groups = 0;
	g.vertices = [];
	g.groups = [];
	for(let r=0; r<g.length; r++) {
		for(let c=0; c<g[r].length; c++) {
			if(g[r][c] == I) {
				g.groups.push([[r,c]]);
				g[r][c] = {
					value: I,
					group: g.groups.length-1
				}
			} else {
				g[r][c] = {value: g[r][c]}
			}
		}
	}
}

function explore(g, {I,O,E}) {
	function()
}

function getIs(g, {I,O,E}={}) {
}

function maySolve(g) {
	let blocksGraph = g.map(r=>r.map(e=>e=='I' ? 0 : 1));
	//return pathsOf(blocksGraph);
	return connectivity(g);
}

// V+F = E+c
function connectivity(g) {
	g = g.map(r=>r.slice());
	let exist = (r,c) => g[r] && g[r][c];
	let count = 0;
	for(let r=0; r<g.length; r++) {
		for(let c=0; c<g[r].length; c++) {
			if(exist(r,c)) {
				count++;
				let connecteds = [[r,c]];
				while(connecteds.length) {
					let [r,c] = connecteds.pop();
					g[r][c] = 0;
					[[-1,0],[0,-1],[1,0],[0,1]].forEach(([x,y])=>exist(r+x,c+y) && connecteds.push([r+x,c+y]));
				}
			}
		}
	}
	return count;
}

function findMinTree(g, {I, O, E}) {
	let exist = (r,c) => g[r] && g[r][c];
	let visited = g.map(r=>r.map(e=>e==I?1:0));
	let neighbors = (r,c) => [[1,0],[0,1],[0,-1],[-1,0]].reduce((a,[x,y])=>(exist(r+x,c+y) && g[r+x][c+y]==E && a.push([r+x,c+y]),a),[]);
	let Is = g.reduce((a,r,i)=>(r.forEach((e,j)=>e==I && a.push([i,j])),a), []);
	let outline = Is.reduce((a,[r,c])=>(a.push(...neighbors(r,c)),a), []);
	let conn = connectivity(visited), vn = 4*Is.length, en = 4*Is.length;
	for(let r=0; r<g.length; r++) {
		for(let c=0; c<g[r].length; c++) {
			g[r][c] == I && exist(r,c+1) && g[r][c+1] == I && (en-=1);
			g[r][c] == I && exist(r+1,c) && g[r+1][c] == I && (en-=1);
			if(r==0) {
				exist(r,c+1) && g[r][c] == I && g[r][c+1] == I && (vn-=1);
			}
			if(c==0) {
				exist(r+1,c) && g[r][c] == I && g[r+1][c] == I && (vn-=1);
			}
			vn -= Math.max([[r,c],[r+1,c],[r,c+1],[r+1,c+1]].reduce((a,[x,y])=>exist(x,y) && g[x][y]==I ? a+1:a , -1), 0);
		}
	}

	if(vn+Is.length != en+conn) return false;

	while(conn > 1) {
	}
}

function pathsOf(g) {
	let rows = g.length, cols = g[0].length;
	let dict = [...Array(rows*cols)].map((_,r)=>[...Array(rows*cols)].map((_,c)=>r==c?[[r/rows|0,r%rows]]:[]));
	let exist = (r,c) => g[r] != null && g[r][c] != null;
	//let len = (n1,n2) => dict[n1] == 

	for(let r=0; r<g.length; r++) {
		for(let c=0; c<g[r].length; c++) {
			let v = g[r][c];
			if(v == 0) continue;
			let vn = r*rows+c;
			let ns = [[-1,0],[0,-1], [0,1],[1,0]].reduce((a,[x,y])=>(exist(r+x,c+y) && g[r+x][c+y] == 1 && a.push([r+x,c+y]),a), []);
			for(let [x,y] of ns) {
				let nn = x*rows+y;
				for(let ev in dict) {
					if(dict[ev][nn].length == 0) continue;
					if(dict[ev][vn].length != 0 && dict[ev][vn].length-1 < dict[ev][nn].length) continue;
					dict[ev][vn] = [...dict[ev][nn], [r,c]];
					dict[vn][ev] = dict[ev][vn].map((_,i,arr)=>arr[arr.length-1-i]);
				}
			}
			for(let v1 in dict) {
				for(let v2 in dict) {
					if(dict[v1][vn].length == 0 || dict[v2][vn].length == 0) continue;
					if(dict[v1][v2].length == 0 ||
						dict[v1][vn].length + dict[vn][v2].length < dict[v1][v2].length 
					)  {
						dict[v1][v2] = [...dict[v1][vn], ...dict[vn][v2]];
					}
				}
			}
		}
	}
	return dict;
}

function findMaxTree(g, {include, exclude, empty, visited, cache}={}) {
	console.log(g.rest);
	if(g.outline.length == 0) {
		return g.rest == 0 ? true : false;
	}
	if(cache == null) cache = {};
	const [I,O,E] = [include, exclude, empty];
	let vi = function(x,y) {
		return visited[x] && visited[x][y];
	}
	let ne = function(x,y) {
		if(g[x] == null || g[x][y] == null || g[x][y] == O) return false;
		return g.outline.every(([r,c])=>r!=x || c!=y);
	}
	let savedOutline = g.outline.map(([x,y])=>[x,y]);
	for(let i=g.outline.length-1; i>=0; i--) {
		let [r,c] = g.outline[i];
		// save state;
		let initMark = g[r][c];

		let edges = [[-1,0], [1,0], [0,-1], [0,1]].reduce((a,[x,y])=>(!vi(r+x,c+y) && a.push([r+x, c+y]), a), []);
		/**
		 * [-1,-1]  [-1,0]  [-1,1]
		 * [0,-1]	[0,0]   [0, 1]
		 * [1,-1]   [1,0]   [1,1]
		let vnum = [[[0,-1],[-1,-1],[-1,0]], [[-1,0],[-1,1],[0,1]],
			[[0,1],[1,1],[1,0]], [[1,0],[1,-1],[0,-1]]]
			.reduce((a,group)=>group.some(([x,y])=>vi(r+x,c+y)) ? a-1:a,4);
		let vertex = g.outline[i];
		let unmark = function() {
			if(initMark == I) g.rest++;
			g[r][c] = initMark;
			visited[r][c] = false;
			g.outline = savedOutline.map(([x,y])=>[x,y]);
		}
		// V+F = E+2 => newV + newF(=1) = newE;
		if(vnum + 1 == edges.length && initMark != O) {
			if(initMark == I) {
				g.rest--;
			} else {
				g[r][c] == I;
			}
			visited[r][c] = true;
			g.outline.splice(i, 1);
			g.outline.splice(0,0,...edges.filter(([x,y])=>ne(x,y)));
			let key = visited.reduce((s,r)=>s+r.join(','), '');
			do {
				if(cache[key] === false)  break;
				let rest = findMaxTree(g, {include, exclude, empty, visited, cache});
				if(rest) {
					return visited;
				} else {
					break;
				}
			} while(0);
			unmark();
			cache[key] = false;
			continue;
		} else {
			// otherwise, there is an extra face, spawned because of circle of tree.
			continue;
		}

	}

	return false;
}

let gm = `                 
I I I I O E E 
               
 E I I I I I O 
               
 I I I I I O I 
               
 I O I I I I I 
               
 I I I I I I I 
               
 I I I I I I E 
               
 I I O O I I I 
                 `;
let gm0 = `
O O I I E I E E
I O I I I E O I
I E E I O E O E
I I O E I E O I
E I O I I E E I
O I O E E I E O
E E O E O O E E
I E O I O I E O
`;

let res = insAndOuts(gm);
//console.log(res ? res.join('\n') : res);
console.log(res);

*/
