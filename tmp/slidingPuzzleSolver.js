
/*
 * move space to [dx, dy];
 */

/*
 * g[space] = [x, y] where [x,y] is the location of space block;
 */
let arr =
[ [ 2, 3, 1 ], [ 0, 6, 8 ], [ 4, 7, 5 ] ]
;

function slidePuzzle(arr){
	let g = initGraph(arr);
    let res = solve(g);

	return res;
}

function initGraph(arr) {
    let g = arr.map(e=>e.slice());
	g.loc = [];
    initLoc: for(let i=0; i<arr.length; i++) {
          for(let j=0; j<arr[0].length;j++) {
			  updateLocation([i,j], g);
          }
    }
	Object.defineProperty(g, 'space', {get(){ return g.loc[0]}, set(v){g.loc[0]=v}});
    g.blocks = [];
	return g;
}

function moveSpaceTo([dx, dy], g, {test, blocks}={}) {
	let taps = [];
	if(blocks == null) {
		blocks = [];
	}

	let sLoc = g.space;
	let availDirects = [];
	let cb = function(){};
	sLoc[0] < dx && (availDirects.push([1,0])) || sLoc[0] > dx && (availDirects.push([-1,0]));
	sLoc[1] < dy && (availDirects.push([0,1])) || sLoc[1] > dy && (availDirects.push([0,-1]));

	if(availDirects.length == 0) {
		return [];
	}
	for(let dir of availDirects) {
		if(blocks.some(p=>p[0]==sLoc[0]+dir[0]&&p[1]==sLoc[1]+dir[1])) {
			continue;
		} 
		if(g.blocks.some(p=>p[0]==sLoc[0]+dir[0]&&p[1]==sLoc[1]+dir[1])) {
			continue;
		} 

		cb = function() {
			swapSpaceWithDirect([dir[0]*-1, dir[1]*-1], g);
		};
		let tapped = swapSpaceWithDirect(dir, g);
		if(tapped != false) {
			let restTaps = moveSpaceTo([dx, dy], g, {test, blocks});
			if(restTaps.length != null) {
				taps.push(tapped);
				taps.push(...restTaps);
				test && cb();
				return taps;
			} else {
				cb();
				continue;
			}
		} else {
			cb();
			continue;
		}
	}
	return false;
}

function tap(pos, g) {
	if(typeof(pos) == 'number') {
		pos = g.loc[pos];
	}
	let [x,y] = pos;
	let dir = [[-1,0], [1,0], [0,-1], [0,1]].find(([r,c])=>x==r+g.space[0] && y==c+g.space[1]);
	if(dir != null) {
		let tapped = swapSpaceWithDirect(dir, g);
		return tapped;
	}
}

function adjustNumber(num, to, g, {markBlock}) {
	if(g == null) {
		g = to;
		to = num;
	}
	let C = g[0].length;
	let toLoc = [(to-1)/C|0, (to-1)%C];
	let taps = moveTile(g.loc[num], toLoc, g);
	markBlock && g.blocks.push(toLoc);
	return taps;
}

function moveTile(pos, to, g) {
	let taps = [];
	if(pos[0] == to[0] && pos[1] == to[1]) {
		return [];
	}
	// the rightest tile of a row has special adjustment.
	if(to[1] == g[0].length-1) {
		return [];
	} else {
		let directs = [];
		to[0] < pos[0] && (directs.push([-1,0])) || to[0] > pos[0] && (directs.push([1,0]));
		to[1] < pos[1] && (directs.push([0,-1])) || to[1] > pos[1] && (directs.push([0,1]));

		for(let dir of directs) {
			let nextPos = [pos[0]+dir[0], pos[1]+dir[1]];

			let sPos = g.space;

			if(nextPos[0]!=sPos[0] || nextPos[1]!=sPos[1]) {
				// move space to next position.
				let spaceMovements = moveSpaceTo(nextPos, g, {test:true, blocks:[pos]});
				if(spaceMovements.length) {
					spaceMovements.forEach(m=>tap(m,g));
					taps.push(...spaceMovements);
				} else {
					let midPos = [g.length-1, g[0].length-1];
					let movements1 = moveSpaceTo(midPos, g, {blocks:[pos]});
					let movements2 = moveSpaceTo(nextPos, g, {blocks:[pos], test:true});
					taps.push(...(movements1 || []));
					if(!movements2.length) {
						continue;
					}
					movements2.forEach(m=>tap(m,g));
					taps.push(...(movements2 || []));
				}
			}
			let tapped = tap(pos, g);
			let rests = moveTile(nextPos, to, g);
			taps.push(tapped, ...rests);
			return taps;
		}
	}
}

function tileExists(pos, g) {
	return g[pos[0]] != null && g[pos[0]][pos[1]] != null;
}

/**
 * 1 3 2     1   2         2   5    
 * 4   5  => 4 3 5 => ...  1 3 8  =>
 * 6 7 8     6 7 8		   4 6 7	
 *
 * 2 3 5	 2 3 5		   1 2 3
 * 1   8 =>  1 8   => ...    8 5
 * 4 6 7	 4 6 7         4 6 7
 */
function swapWithRightTiles(pos, g) {
	// center position.
	let taps = [];
	let tp = function(tile) {
		let tapped = tap(tile,g);
		taps.push(tapped);
	}
	let [r,c] = [pos[0]+1, pos[1]];
	let [
		t1,t2,t3,t4,t5,t6,t7,t8,t9
	]
		= [
		[r-1,c-1], [r-1,c], [r-1,c+1], [r,c-1], [r,c], [r,c+1], [r+1,c-1], [r+1,c], [r+1,c+1]
	];

	if(![t1,t2,t3,t4,t5,t6,t7,t8,t9].every(t=>tileExists(t,g))) {
		return false;
	}

	taps.push(...moveSpaceTo(t5,g,{avoids:[t1,t2,t3],test:false}));
	tp(t2);
	//rotate counter-clockwisely.
	[t3,t6,t9,t8,t7,t4,t1].forEach(t=>tp(t));
	tp(t2);
	tp(t5);
	tp(t6);
	//rotate clockwisely to turn [t1,t2,t3] back to top row;
	[t3,t2,t1,t4].forEach(t=>tp(t));
	return taps;
}

function swapSpaceWithDirect(direct, g) {
	let [x1, y1] = direct;
	let [x, y] = g.space;
	let tapped = null;
	if(g[x+x1] && g[x+x1][y+y1]) {
		[g[x][y], g[x+x1][y+y1]] = [g[x+x1][y+y1], g[x][y]];
		tapped = g[g.space[0]][g.space[1]];
		updateLocation([x,y], g);
		updateLocation([x+x1,y+y1], g);
		return tapped;
	} else {
		return false;
	}
}

function updateLocation([x,y], g) {
	if(tileExists([x,y], g)) {
		g.loc[+g[x][y]] = [x,y];
		return true;
	}
	return false;
}

function solve(g) {
	let taps = [];
	function adjust(num,to,markBlock=true) {
		console.log('Adjust number '+num+' to '+to);
		taps.push(...adjustNumber(num,to,g,{markBlock}));
	}
	function tp(t) {
		taps.push(tap(t,g));
	}
	function ms(t,{test,blocks}={}) {
		taps.push(...moveSpaceTo(t,g,{test,blocks}));
	}
	
	let rows = g.length, cols = g[0].length;
	for(let r=0; r<rows-2; r++) {
		let r0 = (r+1)*cols, r1 = r0-1;
		for(let num=r*cols+1;num<r1;num++) {
			adjust(num,num);
		}
		adjust(r0,r1);
		if(g[r][cols-1] == 0) {
			tp([r+1,cols-1]);
		}
		if(g[r][cols-1] == r1) {
			taps.push(...swapWithRightTiles([r,cols-2],g));
			g.blocks.push([r,cols-1]);
		}else {
			adjust(r1,r1+cols);
			ms([rows-1,cols-1]);
			ms([r,cols-1]);
			tp([r,cols-2]);
			tp([r+1,cols-2]);

			g.blocks.splice(g.blocks.length-1,1,[r,cols-1]);
		};
		console.log(g.map(r=>r.join('  ')).join('\n'));
	}

	// solve bottom two rows.
	let r0 = rows-2, r1 = rows-1;
	for(let c=0; c<cols-2; c++) {
		let n0 = cols*r0+c+1, n1 = cols*r1+c+1;
		adjust(n1,n0);
		if(g[r1][c] == 0) {
			tp([r1,c+1]);
		}
		if(g[r1][c] != n0) {
			adjust(n0,n0+1);
			ms([r1,c]);
			tp([r0,c]);
			tp([r0,c+1]);
			g.blocks.pop();
			g.blocks.push([r1,c]);
		} else {
			/** swap n0 and n1;
			 *
			 *  n1 a b  =>    a b =>  a  b  d  => n1    d =>  n1 n0 a => n0 a  
			 *  n0   d    n1 n0 d       n1 n0      b a  n0    b   d      n1 b d
			 */
			let [t1,t2,t3,t4,t5,t6] = [
				[r0,c], [r0,c+1], [r0,c+2], [r1,c], [r1,c+1], [r1,c+2]
			];
			ms(t5);
			tp(t4),tp(t1);
			[t2,t3,t6,t5,t4].forEach(t=>tp(t));
			[t1,t2,t5, t4,t1,t2].forEach(t=>tp(t));
			[t3,t6,t5, t2,t3,t6].forEach(t=>tp(t));
			[t5,t4,t1,t2,t3].forEach(t=>tp(t));
			g.blocks.push([r1,c]);
		}
	} 
	// solve rest 4(include space) tiles.
	adjust(cols*(rows-1)-1, cols*(rows-1)-1);
	ms([rows-1,cols-1]);
	console.log(g.map(e=>e.join(' ')).join('\n'));
	return g[rows-1][cols-2] == rows*cols-1 ? taps : null;
}

function test1(){
	console.log(g.map(r=>r.join('  ')).join('\n'));
	let taps = [];
	let res = slidePuzzle(g);
	console.log(res.join(','));
	console.log(g.map(r=>r.join('  ')).join('\n'));
}

function test(){
	let g = initGraph(arr);
	console.log(g);
	console.log('////////////////');
	let taps = slidePuzzle(arr);
	let once = true;
	console.log(taps);
	for(let n of taps) {
		if(!tap(n, g) && once){
			console.log(`###################`);
			console.log(g.map(e=>e.join('  ')).join('\n'));
			once = false;
		}; 
	}
	console.log('Final state of taps: ')
	console.log(g.map(e=>e.join('  ')).join('\n'));
}

test();
