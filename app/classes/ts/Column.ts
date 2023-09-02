import { Card } from "./Card";

interface IColumn {
    cards: Array<Card>;
    addCard(card: Card): void;
    removeCard(): void;
}

export class Column implements IColumn {
    cards: Card[];

    constructor() {
        this.cards = [];
    }

    addCard(card: Card): void {
        this.cards.push(card);
    }

    removeCard(): void {
        this.cards.pop()
    }
}
