const boardElem = document.getElementById("board");
const sizeSelect = document.getElementById("sizeSelect");
let currentDifficulty = "easy";

sizeSelect.addEventListener("change", () => {
  generatePuzzle();
});

function emptyBoard(size) {
  const board = [];
  for (let r = 0; r < size; r++) {
    board.push(Array(size).fill(""));
  }
  return board;
}

function generatePuzzle(difficulty = currentDifficulty) {
  currentDifficulty = difficulty;
  const boardSize = parseInt(sizeSelect.value, 10);
  let puzzle = PUZZLES[currentDifficulty];
  if (!puzzle || puzzle.length !== boardSize) {
    puzzle = emptyBoard(boardSize);
  }
  boardElem.innerHTML = "";
  boardElem.style.gridTemplateColumns = `repeat(${boardSize}, 48px)`;

  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      const val = puzzle[r][c];
      cell.textContent = val || "";
      cell.onclick = () => {
        if (cell.textContent === "") cell.textContent = "⚪";
        else if (cell.textContent === "⚪") cell.textContent = "⚫";
        else cell.textContent = "";
      };
      boardElem.appendChild(cell);
    }
  }
}

// show a puzzle on initial load
generatePuzzle();
