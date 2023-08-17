export class Card{
    constructor(suit,rank,faceUp=false){
        this.suit = suit;
        this.rank = rank; 
        this.faceUp = faceUp;  
    }

    flip(){
        this.faceUp = !faceUp;
    }
}