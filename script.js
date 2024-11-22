document.addEventListener('DOMContentLoaded', () => {
    const clickableAreas = document.querySelectorAll('.clickable-area div');

    clickableAreas.forEach(area => {
        area.addEventListener('click', () => {
            const columnId = area.getAttribute('data-add-piece-id');
            const column = document.querySelector(`.columns div[data-column-id="${columnId}"]`);
            if (column) {
                addPieceToColumn(column);
            } else {
                console.error(`Column with ID ${columnId} not found.`);
            }
        });
    });

    function addPieceToColumn(column) {
        const pieces = column.children;
        let availableSpot = null;

        // Find the first available spot from the bottom
        for (let i = pieces.length - 1; i >= 0; i--) {
            if (!pieces[i].classList.contains('filled')) {
                availableSpot = pieces[i];
                break;
            }
        }

        if (!availableSpot) {
            // Create a new piece
            const newPiece = document.createElement('div');
            newPiece.classList.add('piece');
            newPiece.style.backgroundColor = 'red'; // You can change the color based on the player

            // Append the piece to the column
            column.appendChild(newPiece);

            // Animate the piece dropping
            setTimeout(() => {
                newPiece.style.top = `${column.clientHeight - newPiece.clientHeight * (pieces.length + 1)}px`;
                newPiece.classList.add('filled');
            }, 0);
        }
    }
});
