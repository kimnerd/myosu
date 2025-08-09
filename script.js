const boardElem = document.getElementById("board");
const sizeSelect = document.getElementById("sizeSelect");

const checkpointBtn = document.getElementById("checkpointBtn");

let currentDifficulty = "easy";
let fullBoard = [];
let puzzlesByDifficulty = { easy: [], medium: [], hard: [] };

const timerElem = document.getElementById("timer");
let timerStart = null;
let timerInterval = null;

// Hint toggle
let hintsEnabled = false;
let moveHistory = [];
let checkpointState = null;

function toggleHints() {
  hintsEnabled = !hintsEnabled;
  const btn = document.getElementById("hintToggle");
  if (btn) btn.textContent = hintsEnabled ? "Hints: On" : "Hints: Off";
  applyHints();
}

function applyHints() {
  const cells = boardElem.querySelectorAll(".cell");
  cells.forEach((cell) => cell.classList.remove("hint"));
  if (!hintsEnabled) return;

  const size = Math.sqrt(cells.length);
  const board = getCurrentBoard();
  const half = size / 2;

  // Row checks
  for (let r = 0; r < size; r++) {
    const row = board[r];
    let violation = false;
    const countWhite = row.filter((v) => v === "⚪").length;
    const countBlack = row.filter((v) => v === "⚫").length;
    if (countWhite > half || countBlack > half) violation = true;
    for (let c = 2; c < size && !violation; c++) {
      if (row[c] !== "" && row[c] === row[c - 1] && row[c] === row[c - 2]) {
        violation = true;
      }
    }
    if (violation) {
      for (let c = 0; c < size; c++) {
        cells[r * size + c].classList.add("hint");
      }
    }
  }

  // Column checks
  for (let c = 0; c < size; c++) {
    let violation = false;
    const column = board.map((row) => row[c]);
    const countWhite = column.filter((v) => v === "⚪").length;
    const countBlack = column.filter((v) => v === "⚫").length;
    if (countWhite > half || countBlack > half) violation = true;
    for (let r = 2; r < size && !violation; r++) {
      if (
        column[r] !== "" &&
        column[r] === column[r - 1] &&
        column[r] === column[r - 2]
      ) {
        violation = true;
      }
    }
    if (violation) {
      for (let r = 0; r < size; r++) {
        cells[r * size + c].classList.add("hint");
      }
    }
  }

  // Duplicate row checks
  for (let r1 = 0; r1 < size; r1++) {
    for (let r2 = r1 + 1; r2 < size; r2++) {
      const row1 = board[r1];
      const row2 = board[r2];
      if (row1.includes("") || row2.includes("")) continue;
      if (row1.join("") === row2.join("")) {
        for (let c = 0; c < size; c++) {
          cells[r1 * size + c].classList.add("hint");
          cells[r2 * size + c].classList.add("hint");
        }
      }
    }
  }

  // Duplicate column checks
  for (let c1 = 0; c1 < size; c1++) {
    for (let c2 = c1 + 1; c2 < size; c2++) {
      const col1 = [];
      const col2 = [];
      for (let r = 0; r < size; r++) {
        col1.push(board[r][c1]);
        col2.push(board[r][c2]);
      }
      if (col1.includes("") || col2.includes("")) continue;
      if (col1.join("") === col2.join("")) {
        for (let r = 0; r < size; r++) {
          cells[r * size + c1].classList.add("hint");
          cells[r * size + c2].classList.add("hint");
        }
      }
    }
  }
}

function undo() {
  const last = moveHistory.pop();
  if (!last) return;
  last.cell.textContent = last.prev;
  checkSolved();
  applyHints();
}

function toggleCheckpoint() {
  if (!checkpointState) {
    checkpointState = getCurrentBoard();
    checkpointBtn.textContent = "Rollback";
  } else {
    const size = checkpointState.length;
    const cells = boardElem.querySelectorAll(".cell");
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        cells[r * size + c].textContent = checkpointState[r][c];
      }
    }
    checkpointState = null;
    moveHistory = [];
    checkpointBtn.textContent = "Set Checkpoint";
    checkSolved();
    applyHints();
  }
}

checkpointBtn.addEventListener("click", toggleCheckpoint);


sizeSelect.addEventListener("change", () => {
  // regenerate when board size changes
  fullBoard = [];
  generatePuzzle(currentDifficulty);
});

function emptyBoard(size) {
  return Array.from({ length: size }, () => Array(size).fill(""));
}

function cloneBoard(board) {
  return board.map((row) => row.slice());
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function startTimer() {
  if (timerInterval) return;
  timerStart = Date.now();
  timerElem.textContent = "Time: 00:00";
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - timerStart) / 1000);
    const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const seconds = String(elapsed % 60).padStart(2, "0");
    timerElem.textContent = `Time: ${minutes}:${seconds}`;
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function getCurrentBoard() {
  const cells = boardElem.querySelectorAll(".cell");
  const size = Math.sqrt(cells.length);
  const board = [];
  for (let r = 0; r < size; r++) {
    board[r] = [];
    for (let c = 0; c < size; c++) {
      board[r][c] = cells[r * size + c].textContent || "";
    }
  }
  return board;
}

function checkSolved() {
  const board = getCurrentBoard();
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board.length; c++) {
      if (board[r][c] !== fullBoard[r][c]) return false;
    }
  }
  stopTimer();
  alert("congratulation!");
  generatePuzzle(currentDifficulty);
  return true;
}

function isValid(board, row, col, val) {
  const size = board.length;
  const half = size / 2;

  // Row checks
  const rowVals = board[row].slice();
  rowVals[col] = val;
  if (rowVals.filter((v) => v === val).length > half) return false;
  if (col >= 2 && rowVals[col - 1] === val && rowVals[col - 2] === val) return false;
  if (col >= 1 && col < size - 1 && rowVals[col - 1] === val && rowVals[col + 1] === val) return false;

  // Column checks
  const colVals = board.map((r) => r[col]);
  colVals[row] = val;
  if (colVals.filter((v) => v === val).length > half) return false;
  if (row >= 2 && colVals[row - 1] === val && colVals[row - 2] === val) return false;
  if (row >= 1 && row < size - 1 && colVals[row - 1] === val && colVals[row + 1] === val) return false;

  // Unique rows
  if (!rowVals.includes("")) {
    for (let r = 0; r < size; r++) {
      if (r !== row && board[r].join("") === rowVals.join("")) return false;
    }
  }

  // Unique columns
  if (!colVals.includes("")) {
    for (let c = 0; c < size; c++) {
      if (c === col) continue;
      let match = true;
      for (let r = 0; r < size; r++) {
        const v = r === row ? val : board[r][col];
        if (board[r][c] !== v) {
          match = false;
          break;
        }
      }
      if (match) return false;
    }
  }

  return true;
}

function solve(board, row = 0, col = 0, solutions = { count: 0 }, limit = 2) {
  const size = board.length;
  if (row === size) {
    solutions.count++;
    return solutions.count >= limit;
  }
  const nextRow = col === size - 1 ? row + 1 : row;
  const nextCol = col === size - 1 ? 0 : col + 1;
  if (board[row][col] !== "") {
    return solve(board, nextRow, nextCol, solutions, limit);
  }
  for (const val of Math.random() > 0.5 ? ["⚪", "⚫"] : ["⚫", "⚪"]) {
    if (isValid(board, row, col, val)) {
      board[row][col] = val;
      if (solve(board, nextRow, nextCol, solutions, limit)) return true;
      board[row][col] = "";
    }
  }
  return false;
}

function hasUniqueSolution(board) {
  const copy = cloneBoard(board);
  const result = { count: 0 };
  solve(copy, 0, 0, result, 2);
  return result.count === 1;
}

function generateFullBoard(size) {
  const board = emptyBoard(size);
  function fill(row = 0, col = 0) {
    if (row === size) return true;
    const nextRow = col === size - 1 ? row + 1 : row;
    const nextCol = col === size - 1 ? 0 : col + 1;
    const vals = Math.random() > 0.5 ? ["⚪", "⚫"] : ["⚫", "⚪"];
    for (const val of vals) {
      if (isValid(board, row, col, val)) {
        board[row][col] = val;
        if (fill(nextRow, nextCol)) return true;
        board[row][col] = "";
      }
    }
    return false;
  }
  fill();
  return board;
}

function createPuzzleFromFull(board) {
  const size = board.length;
  const puzzle = cloneBoard(board);
  const cells = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      cells.push([r, c]);
    }
  }
  shuffle(cells);
  const removed = [];
  for (const [r, c] of cells) {
    const tmp = puzzle[r][c];
    puzzle[r][c] = "";
    if (hasUniqueSolution(puzzle)) {
      removed.push([r, c]);
    } else {
      puzzle[r][c] = tmp;
    }
  }
  return { puzzle, removed };
}

function createDifficultyBoards(full, removed) {
  const size = full.length;
  const easy = cloneBoard(full);
  const medium = cloneBoard(full);
  const hard = cloneBoard(full);

  const total = removed.length;
  const easyLimit = Math.floor(total / 3);
  const mediumLimit = Math.floor((2 * total) / 3);

  removed.forEach(([r, c], idx) => {
    if (idx < easyLimit) easy[r][c] = "";
    if (idx < mediumLimit) medium[r][c] = "";
    hard[r][c] = "";
  });

  return { easy, medium, hard };
}

function renderBoard(board) {
  const size = board.length;
  boardElem.innerHTML = "";
  const maxBoard = Math.min(window.innerWidth, window.innerHeight) * 0.9;
  const cellSize = Math.floor(maxBoard / size);
  const boardSize = cellSize * size;
  boardElem.style.width = boardSize + "px";
  boardElem.style.height = boardSize + "px";
  boardElem.style.gridTemplateColumns = `repeat(${size}, ${cellSize}px)`;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      const val = board[r][c];
      if (val !== "") {
        cell.textContent = val;
        cell.dataset.fixed = "true";
      }
      cell.style.width = cellSize + "px";
      cell.style.height = cellSize + "px";
      cell.style.lineHeight = cellSize + "px";
      cell.style.fontSize = Math.floor(cellSize * 0.6) + "px";
      cell.onclick = () => {
        if (!cell.dataset.fixed) {
          moveHistory.push({ cell, prev: cell.textContent });
          if (cell.textContent === "") {
            cell.textContent = "⚪";
            if (!timerInterval) startTimer();
          } else if (cell.textContent === "⚪") {
            cell.textContent = "⚫";
          } else {
            cell.textContent = "";
          }
          checkSolved();
          applyHints();
        }
      };
      boardElem.appendChild(cell);
    }
  }
  applyHints();
}

function generatePuzzle(difficulty = currentDifficulty) {
  currentDifficulty = difficulty;
  const size = parseInt(sizeSelect.value, 10);
  moveHistory = [];

  checkpointState = null;
  if (checkpointBtn) checkpointBtn.textContent = "Set Checkpoint";

  stopTimer();
  if (timerElem) timerElem.textContent = "Time: 00:00";

  fullBoard = generateFullBoard(size);
  const { removed } = createPuzzleFromFull(fullBoard);
  puzzlesByDifficulty = createDifficultyBoards(fullBoard, removed);

  renderBoard(puzzlesByDifficulty[difficulty]);
}

// Initial puzzle on load
generatePuzzle();
