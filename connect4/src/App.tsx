import React from "react";
import "./App.css";

let board: string[][] = [
  ["", "", "", "", "", "", ""],
  ["", "", "", "", "", "", ""],
  ["", "", "", "", "", "", ""],
  ["", "", "", "", "", "", ""],
  ["", "", "", "", "", "", ""],
  ["", "", "", "", "", "", ""],
];

let currentTurn: string = "R";
let isAIMoving = false;

function randomizeFirstTurn() {
  currentTurn = Math.random() < 0.5 ? "R" : "B";
  const statusElement = document.getElementById("status");
  if (statusElement) {
    statusElement.textContent =
      currentTurn === "R" ? "Your turn!" : "AI is thinking...";
  }
  if (currentTurn === "B") {
    aiTurn();
  }
}

function checkWin() {
  for (let row: number = 0; row < board.length; row++) {
    for (let column: number = 0; column < board[row].length; column++) {
      if (
        board[row][column] !== "" &&
        board[row][column] === board[row][column + 1] &&
        board[row][column] === board[row][column + 2] &&
        board[row][column] === board[row][column + 3]
      ) {
        return [
          board[row][column],
          [[row], [column]],
          [[row], [column + 1]],
          [[row], [column + 2]],
          [[row], [column + 3]],
        ];
      }
    }
  }

  for (let row: number = 0; row < board.length - 3; row++) {
    for (let column: number = 0; column < board[row].length; column++) {
      if (
        board[row][column] !== "" &&
        board[row][column] === board[row + 1][column] &&
        board[row][column] === board[row + 2][column] &&
        board[row][column] === board[row + 3][column]
      ) {
        return [
          board[row][column],
          [[row], [column]],
          [[row + 1], [column]],
          [[row + 2], [column]],
          [[row + 3], [column]],
        ];
      }
    }
  }

  for (let row: number = board.length - 1; row > 2; row--) {
    for (let column: number = 0; column < board[row].length; column++) {
      if (
        board[row][column] !== "" &&
        board[row][column] === board[row - 1][column + 1] &&
        board[row][column] === board[row - 2][column + 2] &&
        board[row][column] === board[row - 3][column + 3]
      ) {
        return [
          board[row][column],
          [[row], [column]],
          [[row - 1], [column + 1]],
          [[row - 2], [column + 2]],
          [[row - 3], [column + 3]],
        ];
      }
    }
  }

  for (let row: number = board.length - 1; row > 2; row--) {
    for (let column: number = board[row].length - 1; column >= 0; column--) {
      if (
        board[row][column] !== "" &&
        board[row][column] === board[row - 1][column - 1] &&
        board[row][column] === board[row - 2][column - 2] &&
        board[row][column] === board[row - 3][column - 3]
      ) {
        return [
          board[row][column],
          [row, column],
          [[row - 1], [column - 1]],
          [[row - 2], [column - 2]],
          [[row - 3], [column - 3]],
        ];
      }
    }
  }

  for (let x: number = 0; x < board.length; x++) {
    for (let y: number = 0; y < board[x].length; y++) {
      if (board[x][y] === "") {
        return "";
      }
    }
  }

  return ["tie"];
}

async function aiTurn() {
  if (currentTurn !== "B" || isAIMoving) return;
  isAIMoving = true;
  console.log("aiTurn");
  const startTime = performance.now();
  await new Promise((resolve) => setTimeout(resolve, 0));

  let bestMove = [0, 0];
  let bestScore = -Infinity;
  let alpha = -Infinity;
  let beta = Infinity;

  let maxDepth = Number(
    (document.getElementById("depth") as HTMLInputElement)?.value
  );
  let moveCount = 0;
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j] !== "") moveCount++;
    }
  }
  if (moveCount <= 7) maxDepth = Math.min(maxDepth, 12);

  // Prioritize center columns first
  const columnOrder = [3, 2, 4, 1, 5, 0, 6];

  for (const c of columnOrder) {
    // Find the lowest empty row in this column
    let r = 5;
    while (r >= 0 && board[r][c] !== "") r--;
    if (r >= 0) {
      board[r][c] = "B";
      let score = minimax(board, 0, false, alpha, beta, maxDepth);
      board[r][c] = ""; // Undo move

      if (score > bestScore) {
        bestScore = score;
        bestMove = [r, c];
      }
      alpha = Math.max(alpha, bestScore);
      if (beta <= alpha) break;
    }
  }

  (async () => {
    const endTime = performance.now();
    const timeElapsed = endTime - startTime;
    await new Promise((resolve) =>
      setTimeout(resolve, Math.max(0, 750 - timeElapsed))
    );

    board[bestMove[0]][bestMove[1]] = "B";
    const selected = document.querySelector(
      `.row:nth-child(${bestMove[0] + 1}) .circle:nth-child(${bestMove[1] + 1})`
    );
    document
      .querySelector(`.circle[data-lastMove]`)
      ?.removeAttribute("data-lastMove");
    selected?.setAttribute("data-filled", "");
    selected?.setAttribute("data-blue", "");
    selected?.setAttribute("data-lastMove", "");

    if (highlightWin()) return;

    const statusElement = document.getElementById("status");
    if (statusElement) {
      statusElement.textContent = "Your turn!";
    }

    currentTurn = "R";
    isAIMoving = false;
  })();
}

function minimax(
  board: string[][],
  depth: number,
  isMax: boolean,
  alpha: number,
  beta: number,
  maxDepth: number
): number {
  const win = checkWin();
  if (win) {
    if (win[0] === "tie") return 0;
    if (win[0] === "R") return -10 + depth; // Prefer shorter paths to win
    return 10 - depth;
  }

  if (depth >= maxDepth) return 0;

  const columnOrder = [3, 2, 4, 1, 5, 0, 6];

  if (isMax) {
    let bestScore = -Infinity;
    for (const c of columnOrder) {
      let r = 5;
      while (r >= 0 && board[r][c] !== "") r--;
      if (r >= 0) {
        board[r][c] = "B";
        let score = minimax(board, depth + 1, false, alpha, beta, maxDepth);
        board[r][c] = ""; // Undo move

        bestScore = Math.max(bestScore, score);
        alpha = Math.max(alpha, bestScore);
        if (beta <= alpha) break;
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (const c of columnOrder) {
      let r = 5;
      while (r >= 0 && board[r][c] !== "") r--;
      if (r >= 0) {
        board[r][c] = "R";
        let score = minimax(board, depth + 1, true, alpha, beta, maxDepth);
        board[r][c] = ""; // Undo move

        bestScore = Math.min(bestScore, score);
        beta = Math.min(beta, bestScore);
        if (beta <= alpha) break;
      }
    }
    return bestScore;
  }
}

function highlightWin() {
  const win = checkWin();
  if (!win[0]) return false;
  if (win[0] === "tie") {
    const status = document.getElementById("status");
    if (status) {
      status.textContent = "Tie!";
    }
  } else {
    const status = document.getElementById("status");
    if (status) {
      status.textContent = `${win[0] === "R" ? "Red" : "Blue"} has won!`;
    }
    for (let i = 1; i < win.length; i++) {
      const selectedCircle = document.querySelector(
        `.row:nth-child(${Number(win[i][0]) + 1}) .circle[data-column="${Number(
          win[i][1]
        )}"]`
      );
      selectedCircle?.setAttribute("data-green", "");
    }
  }

  return true;
}

function handleClick(column: number) {
  if (currentTurn !== "R") return;
  if (checkWin()) return;
  for (let i: number = 5; i >= 0; i--) {
    if (board[i][column] === "") {
      board[i][column] = currentTurn;
      let selected = document.querySelector(
        `.row:nth-child(${i + 1}) .circle:nth-child(${column + 1})`
      );
      document
        .querySelector(`.circle[data-lastMove]`)
        ?.removeAttribute("data-lastMove");
      selected?.setAttribute("data-filled", "");
      selected?.setAttribute(
        currentTurn === "R" ? "data-red" : "data-blue",
        ""
      );
      selected?.setAttribute("data-lastMove", "");

      if (highlightWin()) return;

      currentTurn = "B";
      const statusElement = document.getElementById("status");
      if (statusElement) {
        statusElement.textContent = "AI is thinking...";
      }

      aiTurn();

      return;
    }
  }
}

const setUp = async () => {
  board = [
    ["", "", "", "", "", "", ""],
    ["", "", "", "", "", "", ""],
    ["", "", "", "", "", "", ""],
    ["", "", "", "", "", "", ""],
    ["", "", "", "", "", "", ""],
    ["", "", "", "", "", "", ""],
  ];

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      const found = document.querySelector(
        `.row:nth-child(${i + 1}) .circle:nth-child(${j + 1})`
      );
      if (found) {
        found.removeAttribute("data-filled");
        found.removeAttribute("data-red");
        found.removeAttribute("data-blue");
        found.removeAttribute("data-green");
        found.removeAttribute("data-lastMove");
      }
    }
  }

  setTimeout(randomizeFirstTurn, 200);
};

function Circle({ column }: { column: number }) {
  return (
    <div
      className="circle"
      data-column={column}
      onClick={() => handleClick(column)}
      tabIndex={0}
    ></div>
  );
}

function Row() {
  return (
    <div className="row">
      <Circle column={0} />
      <Circle column={1} />
      <Circle column={2} />
      <Circle column={3} />
      <Circle column={4} />
      <Circle column={5} />
      <Circle column={6} />
    </div>
  );
}

function App() {
  React.useEffect(() => {
    randomizeFirstTurn();
  }, []);

  return (
    <div className="container">
      <button id="setUp" onClick={setUp}>
        <i className="fa-solid fa-rotate-right"></i>
      </button>
      <h1 id="status">Loading...</h1>
      <div className="controls">
        <label htmlFor="depth" id="depthLabel">
          AI Depth:
        </label>
        <input
          type="number"
          id="depth"
          defaultValue={8}
          min={1}
          max={15}
          onKeyDown={(e) => e.preventDefault()}
        />
      </div>

      <div className="board">
        <Row />
        <Row />
        <Row />
        <Row />
        <Row />
        <Row />
      </div>
    </div>
  );
}

export default App;
