interface ICard{
    suit: string; 
    rank: number;
    faceUp: boolean;
    flip(): void;
}

export class Card implements ICard{
    suit: string;
    rank: number;
    faceUp: boolean;

    constructor(suit:string, rank:number, faceUp:boolean = true){
        this.suit = suit; 
        this.rank = rank; 
        this.faceUp = faceUp;
    }

    flip(){
        this.faceUp = !this.faceUp
    }
}