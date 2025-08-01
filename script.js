const boardElem = document.getElementById("board");
const boardSize = 6;

function generatePuzzle(difficulty) {
  const puzzle = PUZZLES[difficulty];
  boardElem.innerHTML = "";
  boardElem.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;

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
