function cutWithLeftLines(lines, leftestLineIndex, cakeArr, rects) {
	console.log(JSON.stringify(lines), leftestLineIndex);
	debugger;
	if(cakeArr.length == 0) {
		return [];
	}
	let leftest = lines[leftestLineIndex];
	let width = cakeArr[0].length;
	if(leftest.pos == width) {
		return [];
	}
	for(let rect of rects) {
		if(width-leftest.pos < rect.w || leftest.bottom-leftest.top < rect.h) {
			continue;
		}
		let cuttedUnits = cakeArr.reduce((arr, row, i)=>
			i>=leftest.top && i<leftest.top+rect.h ? arr.concat(row.slice(leftest.pos, leftest.pos+rect.w)) : arr
			, [])
		if(cuttedUnits.reduce((count,e)=>count+(e=='o'),0) == 1) {
			let copyLines = lines.map(e=>{return {pos: e.pos, top: e.top, bottom: e.bottom}});
			let replacedLines = [];
			if(leftestLineIndex < copyLines.length-1) {
				replacedLines.splice(0,0,copyLines[leftestLineIndex+1])
				copyLines.splice(leftestLineIndex+1,1);
			}
			copyLines.splice(leftestLineIndex,1);
			if(leftest.bottom-leftest.top != rect.h) { replacedLines.splice(0,0,{pos:leftest.pos, top:leftest.top+rect.h, bottom:leftest.bottom}) }
			replacedLines.splice(0,0,{pos:leftest.pos+rect.w, top:leftest.top, bottom:leftest.top+rect.h});
			if(leftestLineIndex > 0) {
				replacedLines.splice(0,0,copyLines[leftestLineIndex-1]);
				copyLines.splice(leftestLineIndex-1,1);
			}
			for(let i=replacedLines.length-2; i>=0; i--) {
				if(replacedLines[i].pos == replacedLines[i+1].pos) {
					let dropped = replacedLines.splice(i+1, 1)[0];
					replacedLines.splice(i, 1, {pos: dropped.pos, bottom: dropped.bottom, top: replacedLines[i].top});
				}
			}
			copyLines.splice(leftestLineIndex > 0 ? leftestLineIndex-1 : 0, 0, ...replacedLines);
			let newLeftestIndex = copyLines.reduce(([ind, el], e, i)=>e.pos<el.pos ? [i, e] : [ind, el], [-1,{pos:width+1}])[0];
			debugger;
			let restCakes = cutWithLeftLines(copyLines, newLeftestIndex, cakeArr, rects);
			if(restCakes !== false) {
				debugger;
				return [{arr:cakeArr.slice(leftest.top, leftest.top+rect.h).map(row=>row.slice(leftest.pos, leftest.pos+rect.w)), pos: [leftest.pos, leftest.top]}, ...restCakes];
			} 
		} 
	}
	return false;
}

function posibleRectsFor(area) {
	let rects = [];
	for(let i=1; i<=area; i++) {
		if(area % i == 0) {
			rects.push({w:area/i,h:i});
		}
	}
	return rects;
}

function cutCake(cake) {
	let cakeArr = cake.split('\n').map(e=>e.split(''));
	let lines = [{pos: 0, top: 0, bottom: cakeArr.length}];
	debugger;
	let area = cakeArr.length * cakeArr[0].length/cake.match(/o/g).length;
	let rects = posibleRectsFor(area);
	let resultArr = cutWithLeftLines(lines, 0, cakeArr, rects)
	if(resultArr !== false) {
		return resultArr.sort((a,b)=>a.pos[1]*100+a.pos[0]-b.pos[1]*100-b.pos[0]).map(cakePiece=>cakePiece.arr.map(row=>row.join('')).join('\n'));
	} else {
		return [];
	}
}

var cake = 
`.o.o....
........
....o...
........
.....o..
........`;
//console.log(cutCake(cake));
console.log(cutCake(cake).join('\n\n'));
