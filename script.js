document.addEventListener('DOMContentLoaded', () => {
    const clickableAreas = document.querySelectorAll('.clickable-area div');
    const animationStates = Array(7).fill(false);
    const maxPieces = 5;
    const pieceContainerHeight = document.querySelector('.columns div').getBoundingClientRect().height / 5;
    const animationDuration = 1;
    let currentPlayer = 'blue';

    clickableAreas.forEach((area, index) => {
        area.addEventListener('click', () => {
            if (animationStates[index]) return;

            const column = document.querySelector(`.columns div[data-column-id="${index}"]`);
            if (column) {
                spawnPiece(area, column, index);
            } else {
                console.error(`Column with ID ${index} not found.`);
            }
        });
    });

    function spawnPiece(startArea, column, columnIndex) {
        const piecesInColumn = column.children;

        if (piecesInColumn.length >= maxPieces) {
            console.warn(`Column ${columnIndex} is full.`);
            return;
        }

        animationStates[columnIndex] = true;

        const newPiece = document.createElement('div');
        newPiece.classList.add('piece');
        newPiece.style.backgroundColor = currentPlayer === 'blue' ? '#3f51b5' : '#f44336';
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

            animationStates[columnIndex] = false;
            togglePlayer();
        });
    }

    function togglePlayer() {
        currentPlayer = currentPlayer === 'blue' ? 'red' : 'blue';
    }
});