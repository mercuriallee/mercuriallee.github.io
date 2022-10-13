const HRD = {};
(function(){
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

    class Rect {
        /**
         * @param {number} x
         * @param {number }y
         * @param {number} width
         * @param {number} height
         * @param {number} v
         * @param {string} label
         * @param {string} id 
         */
        constructor(x, y, width, height, v, label='', id) {
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
    }

    /**
     * @class
     */
    class Board {

        /**
         * @param {{width: number, height: number, rects: Rect}} 
         */
        constructor({width, height, rects}) {
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
         * @param {string} str
         * @return {Board}
         */
        static eval(str) {
            const dict = {
                '张飞': {aliases: ['x', 'X'], v: 2},
                '马超': {aliases: ['c', 'C'], v: 2},
                '赵云': {aliases: ['f', 'F'], v: 2},
                '黄忠': {aliases: ['a', 'A'], v: 2},
                '魏延': {aliases: ['t', 'T'], v: 2},
                '关羽': {aliases: ['u', 'U'], v: 3},
                '周仓': {aliases: ['m', 'M'], v: 3},
                '孔明': {aliases: ['b', 'B'], v: 3},
                '庞统': {aliases: ['y', 'Y'], v: 3},
                '刘备': {aliases: ['j', 'J'], v: 3},
                '曹操': {aliases: ['g', 'G'], v: 4},
            };
            let arr = str.split(',').map(rowStr=>rowStr.split(''));
            let height = arr.length, width = arr[0].length;
            let rects = [];
            let skips = [...Array(width+1)].map(_=> ({}));
            for(let x=0; x<width; x++) {
                for(let y=0; y<height; y++) {
                    if(skips[x][y]) continue;
                    let label = arr[y][x];
                    if(label == '0') continue;
                    if(label == '1') {
                        rects.push(new Rect(x, y, 1, 1, 1, '卒'));
                        continue;
                    }
                    for(let name in dict) {
                        let {aliases, v} = dict[name];
                        if(aliases.includes(label)) {
                            if(v == 2) skips[x][y+1] = true;
                            else if(v == 3) skips[x+1][y] = true;
                            else if(v == 4) skips[x+1][y] = skips[x][y+1] = skips[x+1][y+1] = true;
                            rects.push(new Rect(x, y, (v+1)/2|0, 2-v%2, v, name));
                            continue;
                        }
                    }
                }
            }
            return new Board({width, height, rects});
        }

        /**
         * @return {string}
         */
        getValue() {
            return [...Array(this.height)].map((_,y)=>[...Array(this.width)].map((_,x)=>this.values(x,y)).join('')).join('\n');
        }

        /**
         * @param {number} x
         * @param {number} y
         * @return {Rect}
         */
        getRect(x, y) {
            return this.rects[x] != null ? this.rects[x][y] : null;
        }

        /**
         * @typedef {[number, number, number, number]} Move
         */

        /**
         * @param {Move} move - [origin_x, origin_y, to_x, to_y]
         * @return {boolean}
         */
        movable(move) {
            let [ox, oy, tx, ty] = move;
            let rect = this.getRect(ox, oy);
            return [...Array(rect.width)].every((_,dx)=>[...Array(rect.height)].every((_,dy)=>this.getRect(tx+dx,ty+dy)===rect || this.values(tx+dx, ty+dy)===0));
        }

        /**
         * @param {number} x
         * @param {number} y
         * @return {number, null}
         */
        values(x, y) {
            return x<0||y<0||x>=this.width||y>=this.height ? null : (this.getRect(x,y)?.v ?? 0);
        }

        /**
         * @param {{wideStep: boolean}} 
         * @return {[Move]}
         */
        nextMoves({wideStep}={wideStep: false}) {
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
        copy() {
            let rects = this._rects.map(({x,y,width:w,height:h,v,label:l,id})=>new Rect(x,y,w,h,v,l,id));
            return new Board({width: this.width, height: this.height, rects});
        }

        /**
         * @param {number} move
         * @param {{inplace: boolean}}
         * @return {Board}
         */
        applyMove(move, {inPlace}={inPlace: false}) {
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

        /**
         * @return {boolean}
         */
        ifSuccess() {
            return this.getRect(1, this.height-1) == this.getRect(2, this.height-1) && this.values(1, this.height-1) == 4;
        }

        /**
         * @return {string,boolean}
         */
        backtrackResolve() {
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
         * @param {{wideStep: boolean}};
         * @return {boolean, string}
         */
        shortestPathResolve({wideStep}={wideStep: false}) {
            let getKey = board => board.getValue();
            let visiteds = new Map, successNode = null;
            visiteds.set(getKey(this), {value: 0, moves: [], board: this.copy()});
            let extentsTree = new Tree(this.nextMoves({wideStep}).map(move=> ({value:1, moves:[move], board: this.applyMove(move)})));
            find_nearest: while(true) {
                let nearest = extentsTree.pop();
                if(nearest == null) break find_nearest;
                let {moves, board} = nearest;
                if(board.ifSuccess() == true) {
                    successNode = visiteds.get(getKey(board));
                    break find_nearest;
                }
                let nextMoves = board.nextMoves({wideStep});
                for(let nextMove of nextMoves) {
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
         * @param {{short: boolean, wideStep: boolean}}
         * @return {Board}
         */
        resolve({short, wideStep} = {short: true, wideStep: true}) {
            if(short) {
                this.solution = this.shortestPathResolve({wideStep});
                return this;
            } else {
                this.solution = this.backtrackResolve();
                return this;
            }
        }

        /**
         * @return {string, undefined}
         */
        descriptSolution() {
            let solution = this.solution;
            if(solution == null) {
                console.log("You should run Board.resolve() first.");
                return;
            }
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
    }

    class Tree {
        /**
         * @typedef {{value:number}} Node
         * @param {[Node]} nodes
         */
        constructor(nodes) {
            this.nodes = [];
            this.Tails = new WeakMap;
            nodes.forEach(n=>this.push(n));
        } 

        /**
         * @param {Node} node1
         * @param {Node} node2
         * @return {number}
         */
        compare(node1, node2) {
        return node1.value != node2.value ? node1.value - node2.value : GlobalHash(node1) - GlobalHash(node2);
        }

        /**
         * @param {Node} node
         * @return {void}
         */
        push(node) {
            let bottom = 0, top = this.nodes.length-1, mid=0, compare=this.compare.bind(this);
            while(bottom <= top) {
                mid = bottom + Math.floor((top-bottom)/2);
                if(compare(this.nodes[mid], node) == 0) {
                    throw new Error("Tree cannot has same-weight-nodes.");
                }
                if(compare(this.nodes[mid], node) < 0) {
                    bottom = mid+1;
                } else {
                    top = mid-1;
                }
            }
            this.nodes.splice(bottom, 0, node);
        }

        /**
         * @return {Node}
         */
        pop() {
            return this.nodes.splice(0,1).pop();
        }

        /**
         * @param {Node} node
         */
        remove(node) {
            let bottom = 0, top = this.nodes.length-1, mid=0, compare=this.compare.bind(this);
            while(bottom <= top) {
                mid = bottom + Math.floor((top-bottom)/2);
                if(compare(this.nodes[mid], node) == 0) {
                    this.nodes.splice(mid, 1);
                    return true;
                }
                if(compare(this.nodes[mid], node) < 0) {
                    bottom = mid+1;
                } else {
                    top = mid-1;
                }
            }
            return false;
        }
    }

    HRD.Tree = Tree;
    HRD.Board = Board;
})();

if(typeof(window) === 'undefined') {
    const Board = HRD.Board;

    if(require.main === module) {
        (function main() {
                let config = require('./hrd_levels/normal.json'), board;
                if(typeof(config.eval) == 'string') {
                    board = Board.eval(config.eval);
                } else {
                    board = new Board({width: config.width, height: config.height, rects: config.rects.map(params=>new Rect(...params))});
                }

                console.log(board.resolve({short: true, wideStep: true}).descriptSolution());
        })();
    }

    module.exports = {
        Board
    }
}
