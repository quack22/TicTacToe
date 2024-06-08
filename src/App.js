import { useState } from "react";

// Komponen untuk kotak pada papan permainan
function Square({ value, onSquareClick, isWinning }) {
  return (
    <button className={`square ${isWinning ? "winning" : ""}`} onClick={onSquareClick}>
      {value}
    </button>
  );
}

// Komponen untuk papan permainan
function Board({ xIsNext, squares, onPlay, winningSquares, playerNames }) {
  function handleClick(i) {
    if (squares[i] || calculateWinner(squares)) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = "Winner: " + (winner.player === "X" ? playerNames.xPlayerName : playerNames.oPlayerName);
  } else if (squares.every(Boolean)) {
    status = "It's a Draw!";
  } else {
    status = "Next Player: " + (xIsNext ? playerNames.xPlayerName : playerNames.oPlayerName);
  }

  const boardRows = [];
  for (let row = 0; row < 3; row++) {
    const rowSquares = [];
    for (let col = 0; col < 3; col++) {
      const index = row * 3 + col;
      rowSquares.push(
        <Square
          key={index}
          value={squares[index]}
          onSquareClick={() => handleClick(index)}
          isWinning={winningSquares.includes(index)}
        />
      );
    }
    boardRows.push(
      <div key={row} className="board-row">
        {rowSquares}
      </div>
    );
  }

  return (
    <>
      <div className="status">{status}</div>
      {boardRows}
    </>
  );
}

// Fungsi untuk menghitung pemenang
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { player: squares[a], line: [a, b, c] };
    }
  }
  return null;
}

// Fungsi untuk menghasilkan langkah AI
function getBotMove(squares, difficulty) {
  const emptySquares = squares
    .map((square, index) => (square === null ? index : null))
    .filter((index) => index !== null);
  
  if (difficulty === "easy") {
    return emptySquares[Math.floor(Math.random() * emptySquares.length)];
  } else if (difficulty === "medium") {
    // Simple AI: Block opponent's winning move
    for (let i = 0; i < emptySquares.length; i++) {
      const newSquares = squares.slice();
      newSquares[emptySquares[i]] = "O";
      if (calculateWinner(newSquares)) {
        return emptySquares[i];
      }
    }
    return emptySquares[Math.floor(Math.random() * emptySquares.length)];
  } else if (difficulty === "hard") {
    // Simple AI: Try to win, else block, else random
    for (let i = 0; i < emptySquares.length; i++) {
      const newSquares = squares.slice();
      newSquares[emptySquares[i]] = "O";
      if (calculateWinner(newSquares)) {
        return emptySquares[i];
      }
    }
    for (let i = 0; i < emptySquares.length; i++) {
      const newSquares = squares.slice();
      newSquares[emptySquares[i]] = "X";
      if (calculateWinner(newSquares)) {
        return emptySquares[i];
      }
    }
    return emptySquares[Math.floor(Math.random() * emptySquares.length)];
  }
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [xPlayerName, setXPlayerName] = useState("");
  const [oPlayerName, setOPlayerName] = useState("");
  const [isMultiplayer, setIsMultiplayer] = useState(true);
  const [difficulty, setDifficulty] = useState("easy");
  const [gameStarted, setGameStarted] = useState(false);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function startGame(event) {
    event.preventDefault();
    setGameStarted(true);
  }

  function resetGame() {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
    setGameStarted(false);
  }

  const winnerInfo = calculateWinner(currentSquares);
  const winningSquares = winnerInfo ? winnerInfo.line : [];

  if (!xIsNext && !isMultiplayer) {
    const botMove = getBotMove(currentSquares, difficulty);
    if (botMove !== null) {
      const nextSquares = currentSquares.slice();
      nextSquares[botMove] = "O";
      handlePlay(nextSquares);
    }
  }

  return (
    <div className="game">
      <h1>TIC TAC TOE</h1>
      {!gameStarted ? (
        <form onSubmit={startGame}>
          <input
            type="text"
            placeholder="Enter Player X Name"
            value={xPlayerName}
            onChange={(e) => setXPlayerName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Enter Player O Name"
            value={oPlayerName}
            onChange={(e) => setOPlayerName(e.target.value)}
            required
            disabled={!isMultiplayer}
          />
          <label>
            <input
              type="checkbox"
              checked={isMultiplayer}
              onChange={(e) => setIsMultiplayer(e.target.checked)}
            />
            Multiplayer
          </label>
          {!isMultiplayer && (
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          )}
          <button type="submit">Start Game</button>
        </form>
      ) : (
        <>
          <div className="game-board">
            <Board
              xIsNext={xIsNext}
              squares={currentSquares}
              onPlay={handlePlay}
              winningSquares={winningSquares}
              playerNames={{ xPlayerName, oPlayerName }}
            />
          </div>
          <button onClick={resetGame}>Play Again</button>
        </>
      )}
    </div>
  );
}
