import React from 'react';
import { Card as CardClass } from '../../classes/ts/Card';
import { Suit } from '../../classes/ts/Deck'
interface CardProps {
    card: CardClass;
}

const Card = ({ card }: CardProps) => {
    const { suit, rank, faceUp, flip } = card;
    console.log(card)
    return (
        <>
        {faceUp ? (
            <div>
              {suit+' '+rank} 
            </div>
          ) : (
            <div>
              :D
            </div> 
          )}
        </>

    )
}

export default Card;