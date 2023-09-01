import { Card } from "./Card";

interface IDeck {
    cards: Array<Card>;
    shuffle(): void;
    draw(): Card | undefined;
}

export const Suit = {
    Hearts : 'hearts',
    Diamonds : 'diamonds',
    Clubs : 'clubs',
    Spades : 'spades',
}

export class Deck implements IDeck {
    cards: Card[] = [];

    constructor() {
        const suits = Object.values(Suit)
        suits.forEach(suit => {
            for (let rank = 1; rank <= 13; rank++) {
                this.cards.push(new Card(suit, rank));
            }
        });
        this.shuffle();
    }

    shuffle(): void {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); // Generar un índice aleatorio
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]]; // Intercambiar elementos
        }
    }

    draw(): Card | undefined {
        return this.cards.pop();
    }
} 