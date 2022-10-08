#!/usr/bin/env node

/**
 * @class
 * @param {[number]} x
 * @param {[number]} y
 * @param {[number]} width
 * @param {[number]} height
 * @param {[number]} v
 */
var Rect = function(x, y, width, height, v) {
    this.x          = x;
    this.y          = y;
    this.width      = width;
    this.height     = height;
    this.v          = v;
}

/**
 * @class
 * @param {{width: number, height: number, rects: Rect}} 
 */
var Board = function({width, height, rects}) {
    this.width      = width;
    this.height     = height;

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

Board.prototype.applyMove = function(move) {
    if(this.movable(move) == false) {
        console.log("Cannot apply move:"+move+' !');
        return false;
    }
    let [ox, oy, tx, ty] = move;
    let rect = this.getRect(ox, oy);
    for(let dx=0; dx<rect.width; dx++) {
        for(let dy=0; dy<rect.height; dy++) {
            this.rects[ox+dx][oy+dy] = null;
        }
    }
    for(let dx=0; dx<rect.width; dx++) {
        for(let dy=0; dy<rect.height; dy++) {
            this.rects[tx+dx][ty+dy] = rect;
        }
    }
    rect.x = tx, rect.y = ty;
    return true;
}

Board.prototype.ifSuccess = function() {
    return this.getRect(1, this.height-1) == this.getRect(2, this.height-1) && this.values(1, this.height-1) == 4;
}

/**
 * @return {string,boolean}
 */
Board.prototype.resolve = function() {
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
            this.applyMove(move);
            let key = this.getValue();
            if(FailsCache[key] != null && FailsCache[key] != 0) {
                this.applyMove([tx, ty, ox, oy]);
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
            this.applyMove([tx, ty, ox, oy]);
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

let board = new Board({width: 4, height: 5, rects: [
    new Rect(0, 0, 1, 2, 2),
    new Rect(1, 0, 1, 1, 1),
    new Rect(2, 0, 1, 2, 2),
    new Rect(1, 1, 1, 1, 1),
    new Rect(3, 1, 1, 1, 1),
    new Rect(0, 2, 2, 2, 4),
    new Rect(2, 2, 1, 2, 2),
    new Rect(3, 2, 1, 2, 2),
    new Rect(0, 4, 2, 1, 3),
    new Rect(2, 4, 1, 1, 1)
]});

console.log(board.resolve());
