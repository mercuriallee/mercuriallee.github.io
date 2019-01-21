
/*
 * move space to [dx, dy];
 */

/*
 * g[space] = [x, y] where [x,y] is the location of space block;
 */

let g =
[ [ 13, 24, 10, 35, 7, 19, 12 ],
  [ 1, 2, 9, 33, 17, 39, 6 ],
  [ 27, 8, 18, 37, 47, 20, 11 ],
  [ 5, 3, 23, 22, 4, 14, 38 ],
  [ 44, 29, 15, 16, 31, 32, 26 ],
  [ 46, 30, 0, 28, 25, 41, 40 ],
  [ 45, 43, 36, 34, 21, 42, 48 ] ]
;

function slidePuzzle(arr){
    let g = arr, taps = [];
    fs: for(let i=0; i<arr.length; i++) {
          for(let j=0; j<arr[0].length;j++) {
             if(arr[i][j] == 0) {
               g.space = [i,j];
               break fs;
             }
          }
    }
    g.blocks = [];
    let res = solve(g, {taps});
	console.log('res length: '+res.length);
	console.log('taps length: '+taps.length);
    if(res) {
      return taps;
    }
    return false;
}

function moveSpaceTo([dx, dy], g, {test, blocks, taps}={}) {
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
		(taps == null || test) && (taps = []);
		if(tapped != false) {
			let restTaps = [];
			let restMovements = moveSpaceTo([dx, dy], g, {test, blocks, taps:restTaps});
			if(restMovements.length != null) {
				taps.push(tapped);
				taps.push(...restTaps);
				test && cb();
				return [[sLoc[0]+dir[0], sLoc[1]+dir[1]], ...restMovements];
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

function tap([x,y], g, {taps}={}) {
	let dir = [[-1,0], [1,0], [0,-1], [0,1]].find(([r,c])=>x==r+g.space[0] && y==c+g.space[1]);
	if(dir != null) {
		let tapped = swapSpaceWithDirect(dir, g);
		taps != null && taps.push(tapped);
		return tapped;
	}
}

function adjustNumber(num, to, g, {markBlock,taps}) {
	if(g == null) {
		g = to;
		to = num;
	}
	const R = g.length, C = g[0].length;
	for(let r=0; r<R; r++) {
		for(let c=0; c<C; c++) {
			if(g[r][c] == num) {
				let toLoc = [(to-1)/C|0, (to-1)%C];
				let movements = moveTile([r,c], toLoc, g,{taps});
				markBlock && g.blocks.push(toLoc);
				return movements;
			}
		}
	}
}

function moveTile(pos, to, g, {taps}={}) {
	let movements = [];
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
				let spaceMovements = moveSpaceTo(nextPos, g, {test:true, blocks:[pos], taps});
				if(spaceMovements.length) {
					spaceMovements.forEach(m=>tap(m,g,{taps}));
					movements = [...spaceMovements];
				} else {
					let midPos = [g.length-1, g[0].length-1];
					let movements1 = moveSpaceTo(midPos, g, {blocks:[pos], taps});
					let movements2 = moveSpaceTo(nextPos, g, {blocks:[pos], test:true, taps});
					if(!movements2.length) {
						continue;
					}
					movements2.forEach(m=>tap(m,g,{taps}));

					movements = [...(movements1 || []), ...(movements2 || [])];
				}
			}
			tap(pos, g, {taps});
			let rests = moveTile(nextPos, to, g, {taps});
			movements = [...movements, pos, ...rests];
			return movements;
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
function swapWithRightTiles(pos, g, {taps}) {
	// center position.
	let tapSeqs = [];
	let tmpTap = tap;
	tp = function(tile) {
		tmpTap(tile,g,{taps});
		tapSeqs.push(tile);
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

	tapSeqs.push(...moveSpaceTo(t5,g,{avoids:[t1,t2,t3],test:false,taps}));
	tp(t2);
	//rotate counter-clockwisely.
	[t3,t6,t9,t8,t7,t4,t1].forEach(t=>tp(t));
	tp(t2);
	tp(t5);
	tp(t6);
	//rotate clockwisely to turn [t1,t2,t3] back to top row;
	[t3,t2,t1,t4].forEach(t=>tp(t));
	return tapSeqs;
}

function swapSpaceWithDirect(direct, g) {
	let [x1, y1] = direct;
	let [x, y] = g.space;
	let tapped = null;
	if(g[x+x1] && g[x+x1][y+y1]) {
		[g[x][y], g[x+x1][y+y1]] = [g[x+x1][y+y1], g[x][y]];
		tapped = g[g.space[0]][g.space[1]];
		g.space = [x+x1, y+y1];
		return tapped;
	} else {
		return false;
	}
}

function solve(g, {taps}={}) {
	let tapSeqs = [];
	let tmpAdjust = adjustNumber, tmpTap = tap, tmpMoveSpace = moveSpaceTo;
	function adjust(num,to,markBlock=true) {
		console.log('Adjust number '+num+' to '+to);
		tapSeqs.push(...tmpAdjust(num,to,g,{markBlock,taps}));
	}
	function tp(t) {
		tapSeqs.push(tmpTap(t,g,{taps}));
	}
	function ms(t,{test,blocks}={}) {
		tapSeqs.push(...tmpMoveSpace(t,g,{test,blocks,taps}));
	}
	
	let rows = g.length, cols = g[0].length;
	for(let r=0; r<rows-2; r++) {
		let r0 = (r+1)*cols, r1 = r0-1;
		for(let num=r*cols+1;num<r1;num++) {
			adjust(num,num);
		}
		adjust(r0,r1);
		if(g[r][cols-1] == r1) {
			tapSeqs.push(...swapWithRightTiles([r,cols-2],g,{taps}));
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
	return g[rows-1][cols-2] == rows*cols-1 ? tapSeqs : null;
}

function test1(){
	console.log(g.map(r=>r.join('  ')).join('\n'));
	let taps = [];
	let res = slidePuzzle(g);
	console.log(res.join(','));
	console.log(g.map(r=>r.join('  ')).join('\n'));
}

function test(){
	let taps = slidePuzzle(g);
	let bl = true;
	for(let n of taps) {
		let i = -1;
		for(let r=0; r<g.length; r++) {
			for(let c=0; c<g[0].length; c++) {
				if(g[r][c] == n) {
					i = [r,c];
				}
			}
		}
		if(!tap(i, g) && bl){
			console.log(`###################`);
			console.log(g.map(e=>e.join('  ')).join('\n'));
			bl = false;
		}; 
	}
	console.log('Final state of taps: ')
	console.log(g.map(e=>e.join('  ')).join('\n'));
}

test();
