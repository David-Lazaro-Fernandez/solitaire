"use client";
import { useEffect, useState } from 'react'
import Image from 'next/image'
import styles from './page.module.css'
import { SpiderSolitaire } from './classes/ts/SpiderSolitaire'
import Card from './components/Card/index';
import { Card as CardClass } from './classes/ts/Card';
import { Column } from './classes/ts/Column';

export default function Home() {
  const [columns, setColumns] = useState<Column[]>([])
  useEffect(() => {
    const game = new SpiderSolitaire()
    game.initializeGame()
    setColumns(game.columns)
    console.log(game.columns)
  }, [])


  return (
    <main>

      {columns ?
        (
          <div className={styles.columns}>
            {columns.map((column, columnIndex) => (
              <div key={columnIndex} className={styles.column}>
                {column.cards.map((card, cardIndex) => (
                  <div key={cardIndex}>
                    Suit: {card.suit}, Rank: {card.rank}
                  </div>
                ))}
              </div>
            ))}
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
