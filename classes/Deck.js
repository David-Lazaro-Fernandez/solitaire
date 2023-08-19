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
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); // Generar un índice aleatorio
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]]; // Intercambiar elementos
        }
    }

    draw() {
        return this.cards.pop();
    }


}