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

    clickableAreas.forEach((area, index) => {
        area.addEventListener('click', () => {
            if (animationStates[index]) return;

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
                alert(`${currentPlayer} wins!`);
                scores[currentPlayer]++;
                resetGame();
            } else {
                togglePlayer();
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

    function checkVictory(x, y) {
        return checkDirection(x, y, 1, 0) || // Horizontal
               checkDirection(x, y, 0, 1) || // Vertical
               checkDirection(x, y, 1, 1) || // Diagonal /
               checkDirection(x, y, 1, -1);  // Diagonal \
    }

    function checkDirection(x, y, dx, dy) {
        let count = 1;
        count += countPieces(x, y, dx, dy);
        count += countPieces(x, y, -dx, -dy);
        return count >= 4;
    }

    function countPieces(x, y, dx, dy) {
        let count = 0;
        let player = grid[x][y];
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

    function resetGame() {
        grid = Array(7).fill(null).map(() => Array(maxPieces).fill(null));
        document.querySelectorAll('.piece').forEach(piece => piece.remove());

        document.querySelectorAll('.clickable-area div').forEach(area => {
            area.classList.remove('disabled');
        });

        document.querySelector('#playerScore').textContent = scores.player;
        document.querySelector('#CPUScore').textContent = scores.CPU;
    }
});