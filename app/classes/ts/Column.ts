import { Card } from "./Card";

interface IColumn {
    cards: Array<Card>;
    addCard(card: Card): void;
    removeCard(card: Card): void;
}

export class Column implements IColumn {
    cards: Card[];

    constructor() {
        this.cards = [];
    }

    addCard(card: Card): void {
        this.cards.push(card);
    }

    removeCard(card: Card): void {
        const index = this.cards.indexOf(card);
        if (index > -1) {
            this.cards.splice(index, 1);
        }
    }
}
