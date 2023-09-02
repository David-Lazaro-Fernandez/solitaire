import { Deck } from "./Deck";
import { Column } from "./Column";
import { Card } from "./Card";


interface ISpiderSolitaire {
    deck: Deck;
    columns: Array<Column>;
    initializeGame(): void;
    moveCard(fromColumn: number, toColumn: number, card: Card): void;
    hint(): void;
    getRandomCard(): Card;
}
export class SpiderSolitaire implements ISpiderSolitaire {
    deck: Deck;
    columns: Column[];

    constructor() {
        this.deck = new Deck();
        this.columns = Array.from({ length: 10 }, () => new Column());
        this.initializeGame();
    }

    initializeGame(): void {
        // Lógica para distribuir las cartas en las columnas
        this.columns.forEach((column) => {
            for (let i = 0; i < 4; i++) { // Asume 4 cartas en cada columna inicialmente
                const card = this.deck.draw();
                if (card) {
                    column.addCard(card);
                }
            }
            column.cards.at(-1)?.flip()
            console.log(column.cards.at(-1))

        });
    }

    moveCard(fromColumnIndex: number, toColumnIndex: number, card: Card): void {
        // Implementar lógica para mover cartas entre columnas
        const fromColumn = this.columns[fromColumnIndex];
        const toColumn = this.columns[toColumnIndex];

        // Validación básica para el movimiento (puede necesitar ajustes según las reglas específicas)
        if (fromColumn && toColumn) {
            fromColumn.removeCard();
            toColumn.addCard(card);
        }
    }

    hint(): void {
        // Implementar lógica para proporcionar una sugerencia
        console.log('Lo siento, las sugerencias aún no están implementadas en este juego.');
    }


    getRandomCard(): Card {
        const Suit = {
            Hearts: 'hearths',
            Diamonds: 'diamonds',
            Clubs: 'clubs',
            Spades: 'spades',
        };

        const suits = [Suit.Hearts, Suit.Diamonds, Suit.Clubs, Suit.Spades];
        const randomSuit = suits[Math.floor(Math.random() * suits.length)];
        const randomRank = Math.floor(Math.random() * 13) + 1;
        return new Card(randomSuit, randomRank);
    }
    // Más métodos según sea necesario para representar las reglas y el estado del juego
}