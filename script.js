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
