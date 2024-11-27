document.addEventListener('DOMContentLoaded', () => {
    const clickableAreas = document.querySelectorAll('.clickable-area div');
    const animationStates = Array(7).fill(false); // Stato animazione per ciascuna colonna
    const maxPieces = 5; // Numero massimo di pezzi per colonna
    const pieceHeight = 105; // Altezza di ciascun pezzo
    const animationSpeed = 300; // Velocità in pixel per secondo

    clickableAreas.forEach((area, index) => {
        area.addEventListener('click', () => {
            if (animationStates[index]) return; // Blocca nuovi click durante l'animazione

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

        // Blocca ulteriori azioni sulla colonna durante l'animazione
        animationStates[columnIndex] = true;

        // Creazione del nuovo pezzo
        const newPiece = document.createElement('div');
        newPiece.classList.add('piece');
        document.body.appendChild(newPiece); // Aggiunge il pezzo direttamente al body per il posizionamento assoluto

        // Calcola la posizione iniziale e finale
        const startRect = startArea.getBoundingClientRect();
        const gridRect = column.parentNode.getBoundingClientRect();

        const initialTop = startRect.top;
        const initialLeft = startRect.left + startRect.width / 2 - newPiece.offsetWidth / 2; // Centrato rispetto al div cliccato

        const targetPosition = piecesInColumn.length;
        const finalTop =
            gridRect.top + gridRect.height - (targetPosition + 1) * pieceHeight; // Posizione finale nella colonna

        // Posiziona il pezzo nella posizione iniziale
        newPiece.style.position = 'absolute';
        newPiece.style.top = `${initialTop}px`;
        newPiece.style.left = `${initialLeft}px`;

        // Calcola la durata dell'animazione
        const distance = finalTop - initialTop;
        const animationDuration = Math.abs(distance / animationSpeed); // Tempo in secondi

        // Aggiungi la transizione
        newPiece.style.transition = `transform ${animationDuration}s ease-in-out`;
        newPiece.style.transform = `translate(${finalTop - initialTop}px)`;

        // Finalizzazione del posizionamento dopo l'animazione
        newPiece.addEventListener('transitionend', () => {
            newPiece.style.transition = ''; // Rimuove la transizione
            newPiece.style.transform = ''; // Resetta la trasformazione
            newPiece.style.position = 'relative'; // Adatta alla colonna
            newPiece.style.top = ''; // Resetta lo stile
            newPiece.style.left = ''; // Resetta lo stile
            column.appendChild(newPiece); // Sposta definitivamente il pezzo nella colonna

            // Sblocca la colonna
            animationStates[columnIndex] = false;
        });
    }
});
