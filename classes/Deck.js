export class Deck {
    constructor() {
        this.cards = []
        ['hearts', 'diamonds', 'clubs', 'spades'].forEach(suit => {
            for (let rank = 1; rank <= 13; rank++) {
                this.cards.push(new Card(suit, rank));
            }
        });
        this.shuffle();
    }
    shuffle() {
        // Implementar un algoritmo de barajado
    }

    draw() {
        return this.cards.pop();
    }


}