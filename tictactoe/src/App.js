import React from 'react';
import './App.css';

function Square(props) {
    return (
        <button className="square" onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            squares: Array(9).fill(null),
        };
    }

    renderSquare(i) {
        return <Square value={this.props.squares[i]} onClick={()=>this.props.onClick(i)}/>;
    }

    render(){
        return (
            <div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stepNumber: 0,
            xIsNext: true,
            history: [
                {
                    squares: Array(9).fill(null),
                }
            ]
        };
    }

    handleClick(i) {
        if(this.wonGame()) {
            return;
        }
        const stepNumber = this.state.stepNumber;
        const history    = this.state.history.slice(0, stepNumber+1);
        const xIsNext    = this.state.xIsNext;
        const current    = history[stepNumber];
        const squares    = current.squares.slice();
        squares[i]       = xIsNext ? 'X' : 'O';
        this.setState({
            stepNumber: stepNumber+1,
            xIsNext: !xIsNext,
            history: history.concat([
                {
                    squares
                }
            ])
        });
    }

    wonGame() {
        const Rows = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
        const squares = this.state.history[this.state.stepNumber].squares.slice();
        const sameSquares = Rows.find(([a,b,c])=>squares[a] && squares[a]===squares[b] && squares[a]===squares[c]);
        if(!sameSquares) return null;
        return squares[sameSquares[0]];
    }

    renderMoves() {
        const history = this.state.history;
        return history.map((_, step)=> {
            let key = 'step'+step;
            let desc = step === 0 ? "Go to game start." : "Go to step "+step;
            return <li className="game-step" key={key} onClick={()=>this.jumpTo(step)}>{desc}</li> ;
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: step%2 === 0,
        });
    }

    render() {
        const winner = this.wonGame();
        const current = this.state.history[this.state.stepNumber];
        const squares = current.squares;
        let status = winner ?  `${winner} win!!!  `:  `Next player: ${this.state.xIsNext ? 'X' : 'O'} `;
        return (
            <div className='game'>
                <div className="game-board"> 
                    <Board squares={squares} onClick={this.handleClick.bind(this)}/>
                </div>
                <div className="game-info"> 
                    <div>{status}</div>
                    <ol> {this.renderMoves()} </ol>
                </div>
            </div>
        );
    }
}

export default Game;
