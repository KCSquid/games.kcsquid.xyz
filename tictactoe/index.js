var player = "X";
var ai = "O";
var currentTurn = ["X", "O"][Math.round(Math.random() * 1)];
var squares = ["", "", "", "", "", "", "", "", ""];


const setUp = async () => {
  currentTurn = [player, ai][Math.round(Math.random() * 1)];
  squares = ["", "", "", "", "", "", "", "", ""];
  $("#status").text("");
  for (let i = 0; i < 9; i++) {
    $(`button:input[value="${i}"]`).html("");
  }

  if (currentTurn == ai) {
    $("#turn").text(`${ai}'s Turn`);
    await aiTurn();
    swapTurn();
    return;
  }

  $("#turn").text(`Your Turn`);
};

const detectWin = (board) => {
  const wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < wins.length; i++) {
    const [x, y, z] = wins[i];
    if (board[x] && board[x] === board[y] && board[y] === board[z]) {
      return board[x];
    }
  }

  for (let i = 0; i < board.length; i++) {
    if (board[i] == "") {
      return "";
    }
  }

  return "tie";
};

const swapTurn = () => {
  if (currentTurn == player) {
    currentTurn = ai;
    $("#turn").text(`${currentTurn}'s Turn`);
  } else {
    currentTurn = player;
    $("#turn").text(`Your Turn`);
  }
};

const handleClick = async (value) => {
  const button = $(`button:input[value="${value}"]`);
  console.log(currentTurn, player)
  if (currentTurn !== player) return;
  if (squares[value] !== "") return;

  console.log(player, ai)
  button.html(`<i class="fa-solid fa-${player == "X" ? "xmark" : "o"}"></i>`);
  button.attr("content", "");
  squares[value] = currentTurn;
  swapTurn();

  let state = detectWin(squares);
  if (state == "tie") {
    $("#status").text("Tie!");
  } else if (state) {
    $("#status").text(`${state} has won the game!`);
  }
  if (state) {
    $("#turn").text("Game Over");
    return;
  }

  await aiTurn();
  swapTurn();

  state = detectWin(squares);
  if (state == "tie") {
    $("#status").text("Tie!");
  } else if (state) {
    $("#status").text(`${state} has won the game!`);
  }
  if (state) {
    $("#turn").text("Game Over");
    currentTurn = -1;
  }
};

const aiTurn = async () => {
  await new Promise((r) => setTimeout(r, 1000));
  var bestScore = -Infinity;
  var bestMove = 0;
  for (let i = 0; i < squares.length; i++) {
    if (squares[i] !== "") continue;
    let tempBoard = [...squares];
    tempBoard[i] = currentTurn;
    let score = minimax(tempBoard, 0, false);
    if (score > bestScore) {
      bestScore = score;
      bestMove = i;
    }
  }

  if (squares.filter((x) => x == "").length == 9) {
    for (let i = 0; i < 100; i++) {
      let random = Math.round(Math.random() * 8);
      if (squares[random] == "") bestMove = random;
    }
  }

  squares[bestMove] = currentTurn;
  $(`button:input[value="${bestMove}"]`).html(`<i class="fa-solid fa-${ai == "O" ? "o" : "xmark"}"></i>`);
};

const minimax = (board, depth, isMax) => {
  let win = detectWin(board);
  if (win === "tie") return 0;
  if (win) return win === currentTurn ? 1 : -1;
  if (isMax) {
    let bestScore = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] !== "") continue;
      let tempBoard = [...board];
      tempBoard[i] = currentTurn;
      score = minimax(tempBoard, depth + 1, false);
      if (score > bestScore) {
        bestScore = score;
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] !== "") continue;
      tempBoard = [...board];
      tempBoard[i] = currentTurn === player ? ai : player;
      score = minimax(tempBoard, depth + 1, true);
      if (score < bestScore) {
        bestScore = score;
      }
    }
    return bestScore;
  }
};

const toggleSettings = () => {
  if ($(".settingsMenu").attr("showing") === "true") {
    $(".settingsMenu").removeAttr("showing");
  } else {
    $(".settingsMenu").attr("showing", "true");
  }
};

window.onload = async () => {
  document.getElementById('playerPieceX').focus()
  $('input[type=radio][name=player_piece]').change(function() {
    if (this.value == 'X') {
        currentTurn = currentTurn == player ? ai : player;
        player = "X";
        ai = "O";
        setUp();
    }
    else if (this.value == 'O') {
        currentTurn = currentTurn == player ? ai : player;
        player = "O";
        ai = "X";
        setUp();
    }
    console.log(player, ai)

  });
  if (currentTurn == ai) {
    $("#turn").text(`${currentTurn}'s Turn`);
    await aiTurn();
    swapTurn();
    return;
  }

  $("#turn").text(`Your Turn`);
  
};

