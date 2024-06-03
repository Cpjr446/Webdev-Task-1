document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const turnDisplay = document.getElementById('turn');
    const timer1Element = document.getElementById('timer1');
    const timer2Element = document.getElementById('timer2');
    let timer1 = 60;
    let timer2 = 60;
    let timerInterval;
    let currentPlayer = 1; // 1 for Red, 2 for Blue
    let gamePaused = false;
    let selectedPiece = null;
    let shootingAnimationPlaying = false;
    let history = [];
    let redoStack = [];

    const pieces = {
        red: {
            titan: { class: 'red titan', name: 'Titan' },
            tank: { class: 'red tank', name: 'Tank' },
            ricochets: { class: 'red ricochets', name: 'Ricochets' },
            semiricochets: { class: 'red semiricochets', name: 'Semi Ricochets' },
            cannon: { class: 'red cannon', name: 'Cannon' }
        },
        blue: {
            titan: { class: 'blue titan', name: 'Titan' },
            tank: { class: 'blue tank', name: 'Tank' },
            ricochets: { class: 'blue ricochets', name: 'Ricochets' },
            semiricochets: { class: 'blue semiricochets', name: 'Semi Ricochets' },
            cannon: { class: 'blue cannon', name: 'Cannon' }
        }
    };

    const initialBoard = [
        [null, null, null, pieces.blue.cannon, null, null, null, null],
        [pieces.blue.titan, pieces.blue.tank, pieces.blue.ricochets, pieces.blue.semiricochets, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [pieces.red.titan, pieces.red.tank, pieces.red.ricochets, pieces.red.semiricochets, null, null, null, null],
        [null, null, null, pieces.red.cannon, null, null, null, null]
    ];

    function createBoard() {
        board.innerHTML = '';
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                const piece = initialBoard[i][j];
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = `piece ${piece.class}`;
                    pieceElement.dataset.type = piece.class.split(' ')[1];
                    pieceElement.dataset.player = piece.class.split(' ')[0];
                    pieceElement.textContent = piece.name;
                    cell.appendChild(pieceElement);
                }
                board.appendChild(cell);
            }
        }

        document.querySelectorAll('.piece').forEach(piece => {
            piece.addEventListener('click', () => {
                if ((currentPlayer === 1 && piece.dataset.player === 'red') ||
                    (currentPlayer === 2 && piece.dataset.player === 'blue')) {
                    highlightMoves(piece);
                    selectedPiece = piece;
                }
            });
        });

        document.querySelectorAll('.cell').forEach(cell => {
            cell.addEventListener('click', () => {
                if (cell.classList.contains('highlight')) {
                    movePiece(cell);
                }
            });
        });
    }

    function highlightMoves(piece) {
        const row = parseInt(piece.parentElement.dataset.row);
        const col = parseInt(piece.parentElement.dataset.col);
        const type = piece.dataset.type;
        clearHighlights();
        const moves = getPossibleMoves(row, col, type);
        moves.forEach(([r, c]) => {
            document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`).classList.add('highlight');
        });
    }

    function getPossibleMoves(row, col, type) {
        const moves = [];
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1], // Vertical and horizontal
            [-1, -1], [-1, 1], [1, -1], [1, 1] // Diagonal
        ];
        if (type !== 'cannon') {
            directions.forEach(([dr, dc]) => {
                const newRow = row + dr;
                const newCol = col + dc;
                if (isValidMove(newRow, newCol)) {
                    moves.push([newRow, newCol]);
                }
            });
        } else if (type === 'cannon' && row === (currentPlayer === 1 ? 7 : 0)) {
            directions.filter(([dr, dc]) => dr === 0).forEach(([dr, dc]) => {
                const newRow = row + dr;
                const newCol = col + dc;
                if (isValidMove(newRow, newCol)) {
                    moves.push([newRow, newCol]);
                }
            });
        }
        return moves;
    }

    function isValidMove(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    function clearHighlights() {
        document.querySelectorAll('.highlight').forEach(cell => {
            cell.classList.remove('highlight');
        });
    }

    function movePiece(targetCell) {
        const piece = selectedPiece;
        const sourceCell = piece.parentElement;
        saveState();
        targetCell.innerHTML = '';
        targetCell.appendChild(piece);
        if (piece.dataset.type === 'cannon') {
            shootBullet(targetCell);
        }
        switchTurn();
        clearHighlights();
    }

    function saveState() {
        const state = {
            boardHTML: board.innerHTML,
            timer1,
            timer2,
            currentPlayer
        };
        history.push(state);
        redoStack = []; // Clear redo stack when new move is made
    }

    function restoreState(state) {
        board.innerHTML = state.boardHTML;
        timer1 = state.timer1;
        timer2 = state.timer2;
        currentPlayer = state.currentPlayer;
        turnDisplay.textContent = currentPlayer === 1 ? "Red's Turn" : "Blue's Turn";
        document.querySelectorAll('.piece').forEach(piece => {
            piece.addEventListener('click', () => {
                if ((currentPlayer === 1 && piece.dataset.player === 'red') ||
                    (currentPlayer === 2 && piece.dataset.player === 'blue')) {
                    highlightMoves(piece);
                    selectedPiece = piece;
                }
            });
        });

        document.querySelectorAll('.cell').forEach(cell => {
            cell.addEventListener('click', () => {
                if (cell.classList.contains('highlight')) {
                    movePiece(cell);
                }
            });
        });
    }

    function undoMove() {
        if (history.length > 0) {
            const state = history.pop();
            redoStack.push({
                boardHTML: board.innerHTML,
                timer1,
                timer2,
                currentPlayer
            });
            restoreState(state);
        }
    }

    function redoMove() {
        if (redoStack.length > 0) {
            const state = redoStack.pop();
            saveState(); // Save current state before redoing
            restoreState(state);
        }
    }

    function switchTurn() {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        turnDisplay.textContent = currentPlayer === 1 ? "Red's Turn" : "Blue's Turn";
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            if (!gamePaused) {
                if (currentPlayer === 1) {
                    timer1--;
                    timer1Element.textContent = timer1;
                    if (timer1 <= 0) {
                        clearInterval(timerInterval);
                        alert('Time\'s up! Blue wins!');
                    }
                } else {
                    timer2--;
                    timer2Element.textContent = timer2;
                    if (timer2 <= 0) {
                        clearInterval(timerInterval);
                        alert('Time\'s up! Red wins!');
                    }
                }
            }
        }, 1000);
    }

    function shootBullet(startCell) {
        if (shootingAnimationPlaying) return; // Prevent multiple shooting animations at once
        const directionX = currentPlayer === 1 ? -1 : 1; // Shooting direction based on current player
        const directionY = 0;
        const startRow = parseInt(startCell.dataset.row);
        const startCol = parseInt(startCell.dataset.col);
        let newRow = startRow + directionX;
        let newCol = startCol + directionY;

        const bullet = document.createElement('div');
        bullet.className = 'bullet';
        board.appendChild(bullet);

        shootingAnimationPlaying = true;

        const shootInterval = setInterval(() => {
            if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8 || gamePaused) {
                clearInterval(shootInterval);
                bullet.remove();
                shootingAnimationPlaying = false;
                return;
            }

            const targetCell = document.querySelector(`.cell[data-row='${newRow}'][data-col='${newCol}']`);
            if (targetCell) {
                bullet.style.top = `${targetCell.offsetTop + targetCell.clientHeight / 2 - bullet.clientHeight / 2}px`;
                bullet.style.left = `${targetCell.offsetLeft + targetCell.clientWidth / 2 - bullet.clientWidth / 2}px`;
                if (targetCell.querySelector('.piece')) {
                    targetCell.querySelector('.piece').remove();
                    clearInterval(shootInterval);
                    bullet.remove();
                    shootingAnimationPlaying = false;
                }
            }

            newRow += directionX;
            newCol += directionY;
        }, 100);
    }

    document.getElementById('pause').addEventListener('click', () => {
        gamePaused = true;
    });

    document.getElementById('resume').addEventListener('click', () => {
        gamePaused = false;
    });

    document.getElementById('reset').addEventListener('click', () => {
        clearInterval(timerInterval);
        timer1 = 60;
        timer2 = 60;
        timer1Element.textContent = timer1;
        timer2Element.textContent = timer2;
        gamePaused = false;
        currentPlayer = 1;
        turnDisplay.textContent = "Red's Turn";
        createBoard();
        history = [];
        redoStack = [];
        startTimer();
    });

    document.getElementById('undo').addEventListener('click', undoMove);
    document.getElementById('redo').addEventListener('click', redoMove);

    createBoard();
    startTimer();
});
