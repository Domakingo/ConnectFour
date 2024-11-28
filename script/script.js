document.addEventListener('DOMContentLoaded', () => {
    playerIcon();

    const clickableAreas = document.querySelectorAll('.clickable-area div');
    const animationStates = Array(7).fill(false);
    const maxPieces = 5;
    const animationDuration = 1;
    let currentPlayer = 'player';
    let allowMove = true;
    let grid = Array(7).fill(null).map(() => Array(maxPieces).fill(null));
    let scores = { player: 0, CPU: 0 };

    const pieceCreated = new Audio('assets/audio/sfx/pieceCreated.wav');
    const piecePlaced = new Audio('assets/audio/sfx/piecePlaced.wav');

    document.getElementById('nightModeToggle').addEventListener('click', function() {
        toggleNightMode();
        const icon = this.querySelector('.fas');
        if (document.body.classList.contains('night-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });    

    function toggleNightMode() {
        document.body.classList.toggle('night-mode');
        document.querySelector('header').classList.toggle('night-mode');
        document.getElementById('gameGrid').classList.toggle('night-mode');
        document.querySelectorAll('.clickable-area div').forEach(div => div.classList.toggle('night-mode'));
        document.querySelector('.columns').classList.toggle('night-mode');
        document.querySelectorAll('.player').forEach(player => player.classList.toggle('night-mode'));
        document.querySelector('.proPic').classList.toggle('night-mode');
        document.querySelector('.proPicArrpheus').classList.toggle('night-mode');
    }

    clickableAreas.forEach((area, index) => {
        area.addEventListener('click', () => {
            if (animationStates[index] || currentPlayer !== 'player') return;

            const column = document.querySelector(`.columns div[data-column-id="${index}"]`);
            if (column && allowMove) {
                allowMove = false;
                pieceCreated.play();
                spawnPiece(area, column, index);
            } else {
                console.error(`Column with ID ${index} not found.`);
            }
        });
    });

    function playerIcon() {
        const randomNumber = Math.floor(Math.random() * 1002);
        const fileName = `assets/img/playerPics/${randomNumber}.png`;
        
        const proPic = document.querySelector('.proPic');
        proPic.style.backgroundImage = `url('${fileName}')`;
    }

    function spawnPiece(startArea, column, columnIndex) {
        const piecesInColumn = column.children;
        const pieceContainerHeight = column.getBoundingClientRect().height / maxPieces;

        animationStates[columnIndex] = true;

        const newPiece = document.createElement('div');
        newPiece.classList.add('piece');
        newPiece.style.backgroundColor = currentPlayer === 'player' ? '#3f51b5' : '#f44336';
        newPiece.style.boxShadow = `0px 0px 0px 5px ${currentPlayer === 'player' ? '#3c4787' : '#963029'} inset`;      
        document.body.appendChild(newPiece);

        const startRect = startArea.getBoundingClientRect();
        const columnRect = column.getBoundingClientRect();

        const initialTop = startRect.top;
        const initialLeft = columnRect.left + columnRect.width / 2 - newPiece.offsetWidth / 2;

        const targetPosition = piecesInColumn.length;
        const finalTop = columnRect.top + columnRect.height - (targetPosition + 1) * pieceContainerHeight;

        newPiece.style.position = 'absolute';
        newPiece.style.top = `${initialTop}px`;
        newPiece.style.left = `${initialLeft}px`;

        const distance = finalTop - initialTop;

        newPiece.style.transition = `transform ${animationDuration}s ease-in-out`;
        newPiece.style.transform = `translateY(${distance}px)`;

        newPiece.addEventListener('transitionend', () => {
            newPiece.style.transition = '';
            newPiece.style.transform = '';
            newPiece.style.position = 'relative';
            newPiece.style.top = '';
            newPiece.style.left = '';
            column.appendChild(newPiece);

            grid[columnIndex][targetPosition] = currentPlayer;
            if (checkVictory(columnIndex, targetPosition)) {
                showResult(`${currentPlayer} wins!`);
                scores[currentPlayer]++;
                resetGame();
            } else if (isBoardFull()) {
                showResult('It\'s a draw!');
                resetGame();
            } else {
                togglePlayer();
                if (currentPlayer === 'CPU') {
                    cpuMove();
                }
            }

            if (piecesInColumn.length >= maxPieces) {
                startArea.classList.add('disabled');
            }

            animationStates[columnIndex] = false;
            allowMove = true;
            piecePlaced.play();
        });
    }

    function togglePlayer() {
        currentPlayer = currentPlayer === 'player' ? 'CPU' : 'player';
    }

    function cpuMove() {
        let bestScore = -Infinity;
        let bestMove = null;
        const maxDepth = 4;

        for (let col = 0; col < grid.length; col++) {
            const row = getAvailableRow(col);
            if (row !== null) {
                grid[col][row] = 'CPU';
                let score = minimax(grid, 0, false, -Infinity, Infinity, maxDepth);
                grid[col][row] = null;
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = { col, row };
                }
            }
        }

        if (bestMove) {
            const column = document.querySelector(`.columns div[data-column-id="${bestMove.col}"]`);
            const area = clickableAreas[bestMove.col];
            spawnPiece(area, column, bestMove.col);
        }
    }

    function minimax(board, depth, isMaximizing, alpha, beta, maxDepth) {
        if (depth >= maxDepth || checkVictoryForPlayer('CPU') || checkVictoryForPlayer('player') || isBoardFull()) {
            return evaluateBoard(board);
        }

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let col = 0; col < board.length; col++) {
                const row = getAvailableRow(col);
                if (row !== null) {
                    board[col][row] = 'CPU';
                    let eval = minimax(board, depth + 1, false, alpha, beta, maxDepth);
                    board[col][row] = null;
                    maxEval = Math.max(maxEval, eval);
                    alpha = Math.max(alpha, eval);
                    if (beta <= alpha) break;
                }
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let col = 0; col < board.length; col++) {
                const row = getAvailableRow(col);
                if (row !== null) {
                    board[col][row] = 'player';
                    let eval = minimax(board, depth + 1, true, alpha, beta, maxDepth);
                    board[col][row] = null;
                    minEval = Math.min(minEval, eval);
                    beta = Math.min(beta, eval);
                    if (beta <= alpha) break;
                }
            }
            return minEval;
        }
    }

    function evaluateBoard(board) {
        let score = 0;

        // Evaluate center column
        const centerColumn = Math.floor(board.length / 2);
        for (let row = 0; row < maxPieces; row++) {
            if (board[centerColumn][row] === 'CPU') score += 3;
            else if (board[centerColumn][row] === 'player') score -= 3;
        }

        // Evaluate all positions
        for (let col = 0; col < board.length; col++) {
            for (let row = 0; row < maxPieces; row++) {
                if (board[col][row] !== null) {
                    score += evaluatePosition(col, row, board[col][row]);
                }
            }
        }

        return score;
    }

    function evaluatePosition(x, y, player) {
        let score = 0;
        const directions = [
            { dx: 1, dy: 0 },  // Horizontal
            { dx: 0, dy: 1 },  // Vertical
            { dx: 1, dy: 1 },  // Diagonal /
            { dx: 1, dy: -1 }  // Diagonal \
        ];

        directions.forEach(direction => {
            let count = 1;
            count += countPieces(x, y, direction.dx, direction.dy, player);
            count += countPieces(x, y, -direction.dx, -direction.dy, player);

            if (count >= 4) {
                score += (player === 'CPU') ? 100 : -100;
            } else if (count === 3) {
                score += (player === 'CPU') ? 10 : -10;
            } else if (count === 2) {
                score += (player === 'CPU') ? 1 : -1;
            }
        });

        return score;
    }

    function countPieces(x, y, dx, dy, player) {
        let count = 0;
        for (let step = 1; step < 4; step++) {
            const nx = x + step * dx;
            const ny = y + step * dy;
            if (nx >= 0 && nx < grid.length && ny >= 0 && ny < maxPieces && grid[nx][ny] === player) {
                count++;
            } else {
                break;
            }
        }
        return count;
    }

    function getAvailableRow(col) {
        for (let row = 0; row < maxPieces; row++) {
            if (grid[col][row] === null) {
                return row;
            }
        }
        return null;
    }

    function checkVictoryForPlayer(player) {
        for (let x = 0; x < grid.length; x++) {
            for (let y = 0; y < maxPieces; y++) {
                if (grid[x][y] === player && checkVictory(x, y)) {
                    return true;
                }
            }
        }
        return false;
    }

    function isBoardFull() {
        for (let col = 0; col < grid.length; col++) {
            if (getAvailableRow(col) !== null) {
                return false;
            }
        }
        return true;
    }    

    function checkVictory(x, y) {
        return checkDirection(x, y, 1, 0) || // Horizontal
               checkDirection(x, y, 0, 1) || // Vertical
               checkDirection(x, y, 1, 1) || // Diagonal /
               checkDirection(x, y, 1, -1);  // Diagonal \
    }

    function checkDirection(x, y, dx, dy) {
        let count = 1;
        count += countPieces(x, y, dx, dy, grid[x][y]);
        count += countPieces(x, y, -dx, -dy, grid[x][y]);
        return count >= 4;
    }

    function resetGame() {
        grid = Array(7).fill(null).map(() => Array(maxPieces).fill(null));
        document.querySelectorAll('.piece').forEach(piece => piece.remove());
    
        document.querySelectorAll('.clickable-area div').forEach(area => {
            area.classList.remove('disabled');
        });
    
        document.querySelector('#playerScore').textContent = scores.player;
        document.querySelector('#CPUScore').textContent = scores.CPU;
    
        allowMove = true;
        currentPlayer = 'player';
    }
    
    function showResult(message) {
        const resultCard = document.getElementById('resultCard');
        const resultMessage = document.getElementById('resultMessage');
        const overlay = document.getElementById('overlay');
        const originalProPic = document.querySelector('.proPic');
        
        // Create a new div for the winner's profile picture
        const winnerProPic = document.createElement('div');
        winnerProPic.classList.add('winnerPic');
        
        // Copy the background image from the original profile picture
        winnerProPic.style.backgroundImage = originalProPic.style.backgroundImage;
    
        // Clear previous profile picture if any
        const existingProPic = resultCard.querySelector('.winnerPic');
        if (existingProPic) {
            existingProPic.remove();
        }
    
        // Append the new profile picture to the result card
        resultCard.appendChild(winnerProPic);
    
        resultMessage.textContent = message;
        resultCard.classList.remove('hidden');
        overlay.classList.remove('hidden'); // Show overlay
    
        // Adjust for night mode
        if (document.body.classList.contains('night-mode')) {
            resultCard.classList.add('night-mode');
        } else {
            resultCard.classList.remove('night-mode');
        }
    
        setTimeout(() => {
            resultCard.classList.add('hidden');
            overlay.classList.add('hidden'); // Hide overlay
            resultCard.removeChild(winnerProPic);
        }, 3000); // Hide after 3 seconds
    }        
});