"use client";
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import styles from './page.module.css'
import { SpiderSolitaire } from './classes/ts/SpiderSolitaire'
import { Column } from './classes/ts/Column';
import { Card } from './classes/ts/Card';

export default function Home() {
  const [columns, setColumns] = useState<Column[]>([])
  const [currentMoreCards, setCurrentMoreCards] = useState(4)

  const [dragSound, setDragSound] = useState<HTMLAudioElement | null>(null);
  const [dropSound, setDropSound] = useState<HTMLAudioElement | null>(null);
  const [addCardsSound, setAddCardsSound] = useState<HTMLAudioElement | null>(null);


  const game = new SpiderSolitaire()

  useEffect(() => {
    setColumns(game.columns)
    const startSound = new Audio('/sounds/start.mp3')
    setDragSound(new Audio('/sounds/drag.mp3'));
    setDropSound(new Audio('/sounds/drop.mp3'));
    setAddCardsSound(new Audio('/sounds/addCards.mp3'));

    startSound.play()
  }, [])


  const handleDragStart = (e: React.DragEvent, card: Card, columnIndex: number, cardIndex: number) => {
    dragSound ? dragSound.play() : null
    e.dataTransfer.setData('card', JSON.stringify(card));
    e.dataTransfer.setData('columnIndex', JSON.stringify(columnIndex));
    e.dataTransfer.setData('cardIndex', JSON.stringify(cardIndex));
    e.currentTarget.classList.add('dragging');
  };

  const handleDrag = (e: React.DragEvent) => {
    const draggingElem = document.querySelector('.dragging') as HTMLElement;
    if (draggingElem) {
      draggingElem.style.left = e.clientX + 'px';
      draggingElem.style.top = e.clientY + 'px';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumnIndex: number) => {
    e.preventDefault();
    dropSound ? dropSound.play(): null
    const card = JSON.parse(e.dataTransfer.getData('card'));
    const sourceColumnIndex = JSON.parse(e.dataTransfer.getData('columnIndex'));
    const sourceCardIndex = JSON.parse(e.dataTransfer.getData('cardIndex'));


    // Verifica si el movimiento es válido
    const isValidMove = (sourceCard: Card, targetColumnIndex: number) => {
      const targetColumn = columns[targetColumnIndex];
      const targetCard = targetColumn.cards.at(-1); // La carta en la parte superior de la pila de destino

      // Si la pila de destino está vacía, cualquier carta puede ser movida
      if (!targetCard) return true;

      // Si la carta de origen es una menos que la carta de destino, el movimiento es válido
      return sourceCard.rank === targetCard.rank - 1;
    };

    if (isValidMove(card, targetColumnIndex)) {
      // Crea una copia de las columnas
      const newColumns = [...columns];

      // Encuentra y elimina la carta de la columna de origen
      const sourceColumn = newColumns[sourceColumnIndex];
      const movingCards = sourceColumn.cards.splice(sourceCardIndex);
      sourceColumn.cards.at(-1)?.faceUp ? null : sourceColumn.cards.at(-1)?.flip()
      // Añade la carta a la columna de destino
      newColumns[targetColumnIndex].cards.push(...movingCards)

      // Actualiza el estado de las columnas
      setColumns(newColumns);
    }
  };

  const addMoreCards = (index: number) => {
    if (index !== currentMoreCards - 1) {
      return
    }
    addCardsSound ? addCardsSound.play() : null
    setCurrentMoreCards((prev) => Math.max(prev - 1, 0));
    const newColumns = [...columns];

    newColumns.forEach(column => {
      const randomCard = game.getRandomCard(); // función que retorna una carta aleatoria
      randomCard.flip();
      column.cards.push(randomCard);
    });

    setColumns(newColumns);
  };
  return (
    <main className={styles.main}>

      {columns ?
        (
          <div className={styles.wrapper}>
            <div className={styles.columns}>
              {columns.map((column, columnIndex) => (
                <div key={columnIndex} className={styles.column}>
                  {column.cards.map((card, cardIndex) => (
                    <div
                      key={cardIndex}
                      draggable="true"
                      onDrag={(e) => handleDrag(e)}
                      onDragStart={(e) => handleDragStart(e, card, columnIndex, cardIndex)}
                      onDragOver={(e) => handleDragOver(e)}
                      onDrop={(e) => handleDrop(e, columnIndex)}
                      onDragEnd={(e) => handleDragEnd(e)}
                    >
                      <Image
                        src={card.image}
                        width={68}
                        height={100}
                        alt={card.rank + ' ' + card.suit}
                      />
                    </div>

                  ))}
                </div>
              ))}
            </div>
            <div className={styles.buttonWrapper}>
              {[...Array(currentMoreCards)].map((_, index) => (
                <Image
                  key={index}
                  src="/card_assets/Back_diamonds_black.png"
                  alt={`more cards button ${index}`}
                  width={68}
                  height={100}
                  onClick={() => addMoreCards(index)}
                  style={{
                    marginLeft: '-50px'
                  }}
                />
              ))}

            </div>
          </div>
        )
        :
        (
          <div>...</div>
        )
      }
    </main>
  )
}
