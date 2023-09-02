interface ICard {
    suit: string;
    rank: number;
    faceUp: boolean;
    image: string;
    color: string;
    stack: [];
    flip(): void;
    getImageUrl(rank: number, suit: string, color: string): string;
}

export class Card implements ICard {
    suit: string;
    rank: number;
    faceUp: boolean;
    image: string;
    color: string;
    stack: [];
    constructor(suit: string, rank: number, faceUp: boolean = false, color: string = 'black', stack:[] = []) {
        this.suit = suit;
        this.rank = rank;
        this.faceUp = faceUp;
        this.color = color;
        this.image = this.getImageUrl(rank, suit, color)
        this.stack = stack;
    }

    flip() {
        this.faceUp = !this.faceUp
        this.image = this.getImageUrl(this.rank, this.suit, this.color)
    }

    getImageUrl(rank: number, suit: string, color: string): string {

        let rankString: string;
        if (!this.faceUp) {
            return `/card_assets/Back_${suit}_${color}.png`
        }
        else {
            switch (rank) {
                case 1:
                    rankString = 'A';
                    break;
                case 11:
                    rankString = 'J';
                    break;
                case 12:
                    rankString = 'Q';
                    break;
                case 13:
                    rankString = 'K';
                    break;
                default:
                    rankString = rank.toString();
            }

            return `/card_assets/${rankString}_${suit}_${color}.png`;
        }
    }

}