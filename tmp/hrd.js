#!/usr/bin/env node

/**
 * @class
 * @param {[number]} x
 * @param {[number]} y
 * @param {[number]} width
 * @param {[number]} height
 * @param {[number]} v
 */
var Rect = function(x, y, width, height, v, label='') {
    this.x          = x;
    this.y          = y;
    this.width      = width;
    this.height     = height;
    this.v          = v;
    this.label      = label;
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
    this.root = null;
    this.size = 0;
    nodes.forEach(n=>this.push(n));
}

/**
 * @param {Object} data
 * @return {void}
 */
Tree.prototype.push = function(data) {
    if(this.root == null) {
        this.root = {data: data, left: null, right: null, parent: null};
    } else {
        let current = this.root;
        while(current != null) {
            if(data.value <= current.data.value) {
                if(current.left == null) {
                    current.left = {data: data, left: null, right: null, parent: current};
                    break;
                } else {
                    current = current.left;
                    continue;
                }
            } else {
                if(current.right == null) {
                    current.right = {data: data, left: null, right: null, parrent: current};
                    break;
                } else {
                    current = current.right;
                }
            }
        }
    }
    this.size++;
}

/**
 * @return {Object}
 */
Tree.prototype.pop = function() {
    let min;
    if(this.root?.left == null) {
        min = this.root?.data;
        this.root = this.root?.right;
        if(this.root?.right?.parent) this.root.right.parent = null;
        this.size = Math.max(0, this.size-1);
        return min;
    } else {
        let leftest = this.root; 
        while(leftest.left != null) {
            leftest = leftest.left;
        }
        min = leftest.data;
        if(leftest.right?.parent) {
            leftest.right.parent = leftest.parent;
        }
        if(leftest.parent?.left) {
            leftest.parent.left = leftest.right;
        }
        this.size--;
        return min;
    }
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
    return this.getRect(x,y)?.v ?? 0;
}

/**
 * @return {[[number]]}
 */
Board.prototype.nextMoves = function() {
    let moves = [];
    for(let x=0; x<this.width; x++) {
        for(let y=0; y<this.height; y++) {
            if(this.values(x,y) == 0) {
                let ox, oy, tx, ty, neighborRect;
                if(x > 0) {
                    neighborRect = this.getRect(x-1, y);
                    if(neighborRect != null) {
                        [ox, oy, tx, ty] = [neighborRect.x, neighborRect.y, neighborRect.x+1, neighborRect.y];
                        if(this.movable([ox, oy, tx, ty])) {
                            moves.push([ox, oy, tx, ty]);
                        }
                    }
                }
                if(x < this.width-1) {
                    neighborRect = this.getRect(x+1, y);
                    if(neighborRect != null) {
                        [ox, oy, tx, ty] = [neighborRect.x, neighborRect.y, neighborRect.x-1, neighborRect.y];
                        if(this.movable([ox, oy, tx, ty])) {
                            moves.push([ox, oy, tx, ty]);
                        }
                    }
                }
                if(y > 0) {
                    neighborRect = this.getRect(x, y-1);
                    if(neighborRect != null) {
                        [ox, oy, tx, ty] = [neighborRect.x, neighborRect.y, neighborRect.x, neighborRect.y+1];
                        if(this.movable([ox, oy, tx, ty])) {
                            moves.push([ox, oy, tx, ty]);
                        }
                    }
                }
                if(y < this.height-1) {
                    neighborRect = this.getRect(x, y+1);
                    if(neighborRect != null) {
                        [ox, oy, tx, ty] = [neighborRect.x, neighborRect.y, neighborRect.x, neighborRect.y-1];
                        if(this.movable([ox, oy, tx, ty])) {
                            moves.push([ox, oy, tx, ty]);
                        }
                    }
                }
            }
        }
    }
    return moves;
}

/**
 * @return {Board}
 */
Board.prototype.copy = function() {
    let rects = this._rects.map(({x,y,width:w,height:h,v})=>new Rect(x,y,w,h,v));
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
    let states = [{nexts: this.nextMoves(), lastMove: [], undo: null}], solved = false;
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
        console.log(states.length);
        return states.map(({lastMove})=>lastMove.join(',')).join("=>\n");
    }
    return false;
}

/**
 * @return {boolean, string}
 */
Board.prototype.shortestPathResolve = function() {
    let visiteds = {}, successNode = null;
    visiteds[this.getValue()] = {value: 0, moves: [], board: this.copy()};
    let extents = this.nextMoves().map(move=> ({value:1, moves:[move.slice()], board: this.applyMove(move)}));
    let extentsTree = new Tree(extents);
    find_nearest: while(true) {
        let nearest = extentsTree.pop();
        if(nearest == null) break find_nearest;
        let {value, moves, board} = nearest;
        let nextMoves = board.nextMoves();
        for(nextMove of nextMoves) {
            ///@type {Board}
            let neighbor = board.applyMove(nextMove, {inPlace: false});
            let key = neighbor.getValue(), visited = visiteds[key];
            if(visited != null) {
                if(visited.value > value+1) {
                    visiteds[key] = {value: value+1, moves: [...moves, nextMove.slice()], board: neighbor};
                }
            } else {
                visiteds[key] = {value: value+1, moves: [...moves, nextMove.slice()], board: neighbor};
                extentsTree.push({value: value+1, moves: [...moves, nextMove.slice()], board: neighbor});
            }
            if(neighbor.ifSuccess() == true) {
                successNode = visiteds[key];
                break find_nearest;
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
Board.prototype.resolve = function({short} = {short: false}) {
    if(short) {
        return this.shortestPathResolve();
    } else {
        return this.backtrackResolve();
    }
}

let board = new Board({width: 4, height: 5, rects: [
    new Rect(0, 0, 1, 2, 2, '张飞'),
    new Rect(1, 0, 2, 2, 4, '曹操'),
    new Rect(3, 0, 1, 2, 2, '赵云'),
    new Rect(0, 2, 1, 2, 2, '黄忠'),
    new Rect(1, 2, 2, 1, 3, '关羽'),
    new Rect(3, 2, 1, 2, 2, '马超'),
    new Rect(1, 3, 1, 1, 1, '卒'),
    new Rect(2, 3, 1, 1, 1, '卒'),
    new Rect(0, 4, 1, 1, 1, '卒'),
    new Rect(3, 4, 1, 1, 1, '卒')
]});

//console.log(board.resolve());
let initBoard = board.copy();
let solution = board.resolve({short: true});
console.log(solution.length);
for(let i=0; i<solution.length; i++) {
    let move = solution[i];
    let [ox, oy, tx, ty] = move;
    let postfix = '';
    if(tx-ox == 1) {
        postfix = '右';
    } else if(tx-ox == -1) {
        postfix = '左';
    } else if(ty-oy == 1) {
        postfix = '下';
    } else if(ty-oy == -1) {
        postfix = '上';
    }
    console.log((' '.repeat(3)+(i+1)+':  ').substr(-6)+board.rects[ox][oy].label+' '+postfix);
    board.applyMove(move, {inPlace: true});
}
