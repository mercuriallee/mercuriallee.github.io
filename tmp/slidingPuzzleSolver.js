
/*
 * move space to [dx, dy];
 */

/*
 * g[space] = [x, y] where [x,y] is the location of space block;
 */

let g = [
	[10, 3, 6, 4],
	[1, 5, 8, 0],
	[2, 13, 7, 15],
	[14, 9, 12, 11]
];
g['space'] = [1,3];
g.blocks = [];

function moveSpaceTo([dx, dy], g, {test, blocks}={}) {
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
		if(swapSpaceWithDirect(dir, g)) {
			let restMovements = moveSpaceTo([dx, dy], g, {test:test, blocks:blocks});
			if(restMovements.length != null) {
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

function tap([x,y], g) {
	let dir = [[-1,0], [1,0], [0,-1], [0,1]].find(([r,c])=>x==r+g.space[0] && y==c+g.space[1]);
	if(dir != null) {
		swapSpaceWithDirect(dir, g);
	}
}

function adjustNumber(num, to, g, {markBlock}) {
	if(g == null) {
		g = to;
		to = num;
	}
	const R = g.length, C = g[0].length;
	for(let r=0; r<R; r++) {
		for(let c=0; c<C; c++) {
			if(g[r][c] == num) {
				let toLoc = [(to-1)/C|0, (to-1)%C];
				let movements = moveTile([r,c], toLoc, g);
				markBlock && g.blocks.push(toLoc);
				return movements;
			}
		}
	}
}

function moveTile(pos, to, g) {
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
				let spaceMovements = moveSpaceTo(nextPos, g, {test:true, blocks:[pos]});
				if(spaceMovements.length) {
					spaceMovements.forEach(m=>tap(m,g));
					movements = [...spaceMovements];
				} else {
					let midPos = [g.length-1, g[0].length-1];
					let movements1 = moveSpaceTo(midPos, g, {blocks:[pos]});
					let movements2 = moveSpaceTo(nextPos, g, {blocks:[pos], test:true});
					if(!movements2.length) {
						continue;
					}
					movements2.length && movements2.forEach(m=>tap(m,g));

					movements = [...(movements1 || []), ...(movements2 || [])];
				}
			}
			tap(pos, g);
			let rests = moveTile(nextPos, to, g);
			try {
				let test = [...movements, pos, ...rests];
			} catch (err) {
				debugger;
			}
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
function swapWithRightTiles(pos, g) {
	// center position.
	let tapSeqs = [];
	let tmpTap = tap;
	tap = function(tile) {
		tmpTap(tile,g);
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

	tapSeqs.push(...moveSpaceTo(t5,g,{avoids:[t1,t2,t3],test:false}));
	tap(t2);
	//rotate counter-clockwisely.
	[t3,t6,t9,t8,t7,t4,t1].forEach(t=>tap(t));
	tap(t2);
	tap(t5);
	tap(t6);
	//rotate clockwisely to turn [t1,t2,t3] back to top row;
	[t3,t2,t1,t4].forEach(t=>tap(t));
	return tapSeqs;
}

function swapSpaceWithDirect(direct, g) {
	let [x1, y1] = direct;
	let [x, y] = g.space;
	if(g[x+x1] && g[x+x1][y+y1]) {
		[g[x][y], g[x+x1][y+y1]] = [g[x+x1][y+y1], g[x][y]];
		g.space = [x+x1, y+y1];
		return g.space;
	} else {
		return false;
	}
}

function solve(g) {
	let tapSeqs = [];
	let tmpAdjust = adjustNumber, tmpTap = tap, tmpMoveSpace = moveSpaceTo;
	function adjust(num,to) {
		console.log('Adjust number '+num+' to '+to);
		tapSeqs.push(...tmpAdjust(num,to,g,{markBlock:true}));
	}
	function tp(t) {
		tapSeqs.push(tmpTap(t,g));
	}
	function ms(t,{test,blocks}={}) {
		tapSeqs.push(...tmpMoveSpace(t,g,{test:test,blocks:blocks}));
	}
	
	let rows = g.length, cols = g[0].length;
	for(let r=0; r<rows-2; r++) {
		let r0 = (r+1)*cols; r1 = r0-1;
		for(let num=r*cols+1;num<r1;num++) {
			adjust(num,num);
		}
		adjust(r0,r1);
		if(g[r][cols-1] == r1) {
			tapSeqs.push(...swapWithRightTiles([r,cols-2],g));
			g.blocks.push([r,cols-2],[r,cols-1]);
		}else {
			adjust(r1,r1+cols);
			ms([rows-1,cols-1]);
			ms([r,cols-1]);
			tp([r,cols-2]);
			tp([r+1,cols-2]);

			g.blocks.splice(g.blocks.length-1,1,[r,cols-2],[r,cols-1]);
		};
		console.log(g.map(r=>r.join('  ')).join('\n'));
	}
	return tapSeqs;
}
/*
let res = [
	...adjustNumber(1,1,g,{markBlock:true}),
	...adjustNumber(2,2,g,{markBlock:true}),
	...adjustNumber(4,3,g,{markBlock:true}),
	...adjustNumber(3,7,g,{markBlock:true})
];
*/

console.log(g.map(r=>r.join('  ')).join('\n'));
let res = solve(g);
console.log(res.length);
console.log(g.map(r=>r.join('  ')).join('\n'));
