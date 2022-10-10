#!/usr/bin/env node

/**
 * @class
 * @param {[number]} x
 * @param {[number]} y
 * @param {[number]} width
 * @param {[number]} height
 * @param {[number]} v
 */
const GlobalHash = (function() {
    let o = {};
    o.count = 0;
    o.map = new WeakMap;

    return function(object) {
        let hash = o.map.get(object);
        if(hash == null) {
            hash = o.count;
            o.map.set(object, o.count++);
        }
        return hash;
    }
})();

var Rect = function(x, y, width, height, v, label='', id) {
    this.x          = x;
    this.y          = y;
    this.width      = width;
    this.height     = height;
    this.v          = v;
    this.label      = label;
    this.id         = id;

    if(typeof(id)=='undefined'){
        this.id     = GlobalHash(this);
    }
}

/**
 * @class
 * @param {{width: number, height: number, rects: Rect}} 
 */
var Board = function({width, height, rects}) {
    this.width      = width;
    this.height     = height;

    this._rects     = rects;
    this.rects      = Array(height).fill(0).map(_=>Array(width));

    for(let rect of rects) {
        let {x, y, width, height} = rect;
        for(let dx=0; dx<width; dx++) {
            for(let dy=0; dy<height; dy++) {
                this.rects[x+dx][y+dy]  = rect;
            }
        }
    }
}

/**
 * @class
 * @param {[Object]} nodes
 */
var Tree = function(nodes) {
    this.nodes = [];
    this.Tails = new WeakMap;
    nodes.forEach(n=>this.push(n));
}

Tree.prototype.compare = function(node1, node2) {
    return node1.value != node2.value ? node1.value - node2.value : GlobalHash(node1) - GlobalHash(node2);
}

/**
 * @param {Object} node
 * @return {void}
 */
Tree.prototype.push = function(node) {
    if(this.nodes.length == 0) {
        this.nodes.push(node);
        return;
    }

    let bottom = 0, top = this.nodes.length-1, mid=0, compare=this.compare.bind(this);
    while(bottom < top) {
        mid = bottom + Math.floor((top-bottom)/2);
        if(compare(this.nodes[mid], node) == 0) {
            debugger;
            throw new Error("Tree cannot has same-weight-nodes.");
        }
        if(compare(this.nodes[mid], node) < 0) {
            bottom = mid+1;
        } else {
            top = mid;
        }
    }
    this.nodes.splice(compare(this.nodes[bottom], node)>0 ?bottom:bottom+1, 0, node);
}

/**
 * @return {Object}
 */
Tree.prototype.pop = function() {
    return this.nodes.splice(0,1).pop();
}

Tree.prototype.remove = function(node) {
    if(this.nodes.length == 0) return false;
    let bottom = 0, top = this.nodes.length-1, mid=0, compare=this.compare.bind(this);
    while(bottom < top) {
        mid = bottom + Math.floor((top-bottom)/2);
        if(compare(this.nodes[mid], node) == 0) {
            bottom = mid;
            break;
        }
        if(compare(this.nodes[mid], node) < 0) {
            bottom = mid+1;
        } else {
            top = mid;
        }
    }
    if(compare(this.nodes[bottom], node) == 0) {
        this.nodes.splice(bottom,1);
        return true;
    } 
    return false;
}

/**
 * @return {string}
 */
Board.prototype.getValue = function() {
    return [...Array(this.height)].map((_,y)=>[...Array(this.width)].map((_,x)=>this.values(x,y)).join('')).join('\n');
}

/**
 * @return {Rect}
 */
Board.prototype.getRect = function(x, y) {
    return this.rects[x] != null ? this.rects[x][y] : null;
}

/**
 * @param {[number]} move
 * @return {boolean}
 */
Board.prototype.movable = function(move) {
    let [ox, oy, tx, ty] = move;
    let rect = this.getRect(ox, oy);
    return [...Array(rect.width)].every((_,dx)=>[...Array(rect.height)].every((_,dy)=>this.getRect(tx+dx,ty+dy)===rect || this.values(tx+dx, ty+dy)===0));
}

/**
 * @param {number} x
 * @param {number} y
 */
Board.prototype.values = function(x, y) {
    return x<0||y<0||x>=this.width||y>=this.height ? null : (this.getRect(x,y)?.v ?? 0);
}

/**
 * @return {[[number]]}
 */
Board.prototype.nextMoves = function({wideStep}={wideStep: false}) {
    let board = this;
    function nextMovesOfRect(rect, board, blockDirect) {
        let moves = [];
        for(let [dx, dy] of [[-1,0],[0,-1],[1,0],[0,1]]) {
            if(blockDirect && blockDirect[0] == dx && blockDirect[1] == dy) continue;
            let move = [rect.x, rect.y, rect.x+dx, rect.y+dy];
            if(board.movable(move)) {
                moves.push(move);
                let nextBoard = board.applyMove(move, {inPlace: false});
                if(wideStep) {
                    let nextMoves = nextMovesOfRect(nextBoard.getRect(move[2], move[3]), nextBoard, [-dx, -dy]);
                    nextMoves.forEach(([,, tx, ty])=> moves.push([move[0],move[1],tx,ty]));
                }
            }
        }
        return moves;
    }
    let moves = this._rects.reduce((ms, rect)=>(ms.push(...nextMovesOfRect(rect, board)), ms), []);
    let cache={};
    moves.forEach(e=>cache[e]=e);
    return Object.values(cache);
}

/**
 * @return {Board}
 */
Board.prototype.copy = function() {
    let rects = this._rects.map(({x,y,width:w,height:h,v,label:l,id})=>new Rect(x,y,w,h,v,l,id));
    return new Board({width: this.width, height: this.height, rects});
}

/**
 * @param {number} move
 * @return {Board}
 */
Board.prototype.applyMove = function(move, {inPlace}={inPlace: false}) {
    let board = inPlace ? this : this.copy();
    if(board.movable(move) == false) {
        throw new Error("Cannot apply move:"+move+' !');
    }
    let [ox, oy, tx, ty] = move;
    let rect = board.getRect(ox, oy);
    for(let dx=0; dx<rect.width; dx++) {
        for(let dy=0; dy<rect.height; dy++) {
            board.rects[ox+dx][oy+dy] = null;
        }
    }
    for(let dx=0; dx<rect.width; dx++) {
        for(let dy=0; dy<rect.height; dy++) {
            board.rects[tx+dx][ty+dy] = rect;
        }
    }
    rect.x = tx, rect.y = ty;

    return board;
}

Board.prototype.ifSuccess = function() {
    return this.getRect(1, this.height-1) == this.getRect(2, this.height-1) && this.values(1, this.height-1) == 4;
}

/**
 * @return {string,boolean}
 */
Board.prototype.backtrackResolve = function() {
    const FailsCache = {};
    let states = [{nexts: this.nextMoves(), lastMove: null, undo: null}], solved = false;
    backtrack: while(true) {

        //看
        if(this.ifSuccess() == true ) {
            solved = true;
            break backtrack;
        }
        let state = states[states.length-1];
        if(state == null) {
            success = false;
            break backtrack;
        }
        let {nexts, undo} = state;

        //还
        if(typeof(undo) == 'function') undo();

        //试
        let ifMoved = false, ox,oy,tx,ty;
        travel_moves: while(nexts.length) {
            let move = nexts.pop();
            [ox, oy, tx, ty] = move;
            this.applyMove(move, {inPlace: true});
            let key = this.getValue();
            if(FailsCache[key] != null && FailsCache[key] != 0) {
                this.applyMove([tx, ty, ox, oy], {inPlace: true});
                continue travel_moves;
            } else {
                ifMoved = true;
                break travel_moves;
            }
        }

        //退
        if(ifMoved == false) {
            FailsCache[this.getValue()] = 2;
            states.pop();
            continue backtrack;
        }

        //探
        let nextNexts = this.nextMoves().filter(([ox1,oy1,tx1,ty1])=>!(ox1==tx && oy1==ty && tx1==ox && ty1==oy));
        let nextState = {nexts: nextNexts, lastMove: [ox, oy, tx, ty], undo: null};

        //留
        state.undo = (function() {
            this.applyMove([tx, ty, ox, oy], {inPlace: true});
        }).bind(this);

        //进
        states.push(nextState);
        FailsCache[this.getValue()] = 1;
    }
    if(solved) {
        return states.map(({lastMove})=>lastMove).filter(move=>move!=null);
    }
    return false;
}

/**
 * @return {boolean, string}
 */
Board.prototype.shortestPathResolve = function({wideStep}={wideStep: false}) {
    let getKey = board => board.getValue();
    let visiteds = new Map, successNode = null;
    visiteds.set(getKey(this), {value: 0, moves: [], board: this.copy()});
    let extentsTree = new Tree(this.nextMoves({wideStep}).map(move=> ({value:1, moves:[move.slice()], board: this.applyMove(move)})));
    find_nearest: while(true) {
        let nearest = extentsTree.pop();
        if(nearest == null) break find_nearest;
        let {moves, board} = nearest;
        if(board.ifSuccess() == true) {
            successNode = visiteds.get(getKey(board));
            break find_nearest;
        }
        let nextMoves = board.nextMoves({wideStep});
        for(nextMove of nextMoves) {
            ///@type {Board}
            let neighbor = board.applyMove(nextMove, {inPlace: false});
            let key = getKey(neighbor), visited = visiteds.get(key);
            let movesToNeighbor = [...moves, nextMove];
            let stepsToNeighbor = movesToNeighbor.length;
            let neighborNode = {value: stepsToNeighbor, moves: movesToNeighbor, board: neighbor};
            if(visited != null) {
                if(visited.value > stepsToNeighbor) {
                    if(extentsTree.remove(visited)) {
                        extentsTree.push(neighborNode);
                    }
                    visiteds.set(key, neighborNode);
                }
            } else {
                visiteds.set(key, neighborNode);
                extentsTree.push(neighborNode);
            }
        }
    }
    if(successNode != null) {
        return successNode.moves;
    } 
    return false;
}

/**
 * @return {boolean, string}
 */
Board.prototype.resolve = function({short, wideStep} = {short: false, wideStep: false}) {
    if(short) {
        return this.shortestPathResolve({wideStep});
    } else {
        return this.backtrackResolve();
    }
}

/**
 * @param [[number]] solution
 */
Board.prototype.descriptSolutionByLabel = function(solution) {
    let output = "", board = this.copy();
    output += `The solution has ${solution.length} steps.\n`;
    let idLen = (solution.length+'').length;
    for(let i=0; i<solution.length; i++) {
        let move = solution[i], [ox, oy, tx, ty] = move, postfix = '';
        if(tx - ox > 0) {
            postfix += "右"+(tx-ox>1 ? tx-ox+"步":"");
        } else if(tx - ox <0) {
            postfix += "左"+(ox-tx>1 ? ox-tx+"步":"");
        }
        if(ty-oy != 0) {
            if(postfix.length) postfix = postfix+', ';
            if(ty-oy > 0) {
                postfix += "下"+(ty-oy>1 ? ty-oy+"步":"");
            } else {
                postfix += "上"+(oy-ty>1 ? oy-ty+"步":"");
            }
        }
        output += `${(' '.repeat(idLen)+(i+1)).substr(-idLen)}: ${board.getRect(ox, oy).label} ${postfix}\n`;
        board.applyMove(move, {inPlace: true});
    }
    return output;
}

let config = require('./hrd_levels/48.json'), board;
if(config == null) {
    board = new Board({width: 4, height: 5, rects: [
        new Rect(0, 0, 1, 1, 4, '卒'),
        new Rect(1, 0, 2, 1, 3, '关羽'),
        new Rect(3, 0, 1, 1, 1, '卒'),
        new Rect(0, 1, 1, 2, 2, '张飞'),
        new Rect(1, 1, 2, 2, 4, '曹操'),
        new Rect(3, 1, 1, 2, 2, '赵云'),
        new Rect(0, 3, 2, 1, 3, '关羽'),
        new Rect(2, 3, 2, 1, 3, '周仓'),
        new Rect(0, 4, 1, 1, 1, '卒'),
        new Rect(3, 4, 1, 1, 1, '卒')
    ]});
} else {
    board = new Board({width: config.width, height: config.height, rects: config.rects.map(params=>new Rect(...params))});
}

let initBoard = board.copy();
let solution = board.resolve({short: true, wideStep: true});
console.log(solution.length);
console.log(initBoard.descriptSolutionByLabel(solution));
