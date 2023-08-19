import { Deck } from "./Deck";
import { Column } from "./Column";
import { Card } from "./Card";


interface ISpiderSolitaire{
    deck: Deck; 
    columns: Array<Column>; 
    initializeGame(): void; 
    moveCard(fromColumn:number, toColumn:number, card:Card): void; 
    hint(): void;
}
export class SpiderSolitaire implements ISpiderSolitaire{
    deck: Deck;
    columns: Column[];

    constructor() {
        this.deck = new Deck();
        this.columns = Array.from({ length: 10 }, () => new Column());
        this.initializeGame();
    }

    initializeGame(): void {
        // Lógica para distribuir las cartas en las columnas
    }

    moveCard(fromColumn: number, toColumn: number, card: Card): void {
        // Implementar lógica para mover cartas entre columnas
    }

    hint(): void {
        // Implementar lógica para proporcionar una sugerencia
    }

    // Más métodos según sea necesario para representar las reglas y el estado del juego
}