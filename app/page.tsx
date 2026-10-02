"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react'
import styles from './page.module.css'
import CardView from './components/Card';
import { preloadImages } from './helpers/preloadImages';
import { allCardImageUrls, CARD_BACK_IMAGE, cardImageUrl, cardLabel } from './game/cards';
import {
  canDeal, dealRow, GameState, isMovableStack, isWon, moveStack, MoveResult,
  newGame, remainingDeals, RUNS_TO_WIN, SuitCount,
} from './game/spider';
import type { WinnableDeal } from './game/winnableDeal';

const playSound = (sound: HTMLAudioElement | null | undefined) => {
  if (!sound) return
  sound.currentTime = 0
  // play() rejects if the user hasn't interacted with the page yet; that's fine to ignore
  sound.play().catch(() => undefined)
}

type SoundName = 'start' | 'drag' | 'drop' | 'addCards' | 'clearedStack'

export default function Home() {
  const [suitCount, setSuitCount] = useState<SuitCount>(1)
  const [game, setGame] = useState<GameState | null>(null)
  const [deal, setDeal] = useState<WinnableDeal | null>(null)
  const [imagesReady, setImagesReady] = useState(false)

  // Kept in refs: these never affect rendering, so changing them shouldn't trigger re-renders
  const dragSourceRef = useRef<{ columnIndex: number, cardIndex: number } | null>(null)
  const soundsRef = useRef<Partial<Record<SoundName, HTMLAudioElement>>>({})
  const workerRef = useRef<Worker | null>(null)

  const startGame = useCallback((suits: SuitCount) => {
    workerRef.current?.terminate()
    setGame(null)
    // The worker shuffles until its solver proves the deal can be won, then sends back the seed
    const worker = new Worker(new URL('./game/deal.worker.ts', import.meta.url))
    workerRef.current = worker
    worker.onmessage = (e: MessageEvent<WinnableDeal>) => {
      worker.terminate()
      workerRef.current = null
      setDeal(e.data)
      setGame(newGame(e.data.seed, suits))
      playSound(soundsRef.current.start)
    }
    worker.postMessage({ suitCount: suits })
  }, [])

  useEffect(() => {
    soundsRef.current = {
      start: new Audio('/sounds/start.mp3'),
      drag: new Audio('/sounds/drag.mp3'),
      drop: new Audio('/sounds/drop.mp3'),
      addCards: new Audio('/sounds/addCards.mp3'),
      clearedStack: new Audio('/sounds/cleared_stack.mp3'),
    }

    let cancelled = false
    preloadImages(allCardImageUrls()).then(() => {
      if (!cancelled) setImagesReady(true)
    })
    startGame(1)
    return () => {
      cancelled = true
      workerRef.current?.terminate()
    }
  }, [startGame])

  const handleDragStart = useCallback((e: React.DragEvent, columnIndex: number, cardIndex: number) => {
    playSound(soundsRef.current.drag)
    dragSourceRef.current = { columnIndex, cardIndex }
    // Firefox won't start a drag without some data set
    e.dataTransfer.setData('text/plain', '')
    e.dataTransfer.effectAllowed = 'move'
    e.currentTarget.classList.add(styles.dragging)
  }, [])

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    e.currentTarget.classList.remove(styles.dragging)
    dragSourceRef.current = null
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const applyResult = (result: MoveResult | null, sound: SoundName) => {
    if (!result) return
    playSound(soundsRef.current[result.completedRun ? 'clearedStack' : sound])
    setGame(result.state)
  }

  const handleDrop = (e: React.DragEvent, targetColumnIndex: number) => {
    e.preventDefault();
    const source = dragSourceRef.current
    if (!game || !source) return
    applyResult(moveStack(game, source.columnIndex, source.cardIndex, targetColumnIndex), 'drop')
  };

  const handleDeal = () => {
    if (game) applyResult(dealRow(game), 'addCards')
  };

  const changeSuitCount = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const suits = Number(e.target.value) as SuitCount
    setSuitCount(suits)
    startGame(suits)
  }

  if (!imagesReady || !game) {
    return <main className={styles.main}><div className={styles.message}>Shuffling a winnable deal...</div></main>
  }

  const won = isWon(game)
  const dealsLeft = remainingDeals(game)

  return (
    <main className={styles.main}>
      <div className={styles.wrapper}>
        <div className={styles.toolbar}>
          <select value={suitCount} onChange={changeSuitCount} aria-label="Difficulty">
            <option value={1}>1 suit</option>
            <option value={2}>2 suits</option>
            <option value={4}>4 suits</option>
          </select>
          <button onClick={() => startGame(suitCount)}>New game</button>
          {deal && <span title={deal.verified ? 'The solver found a way to win this deal' : 'The solver ran out of time on this deal'}>
            Deal #{deal.seed}{deal.verified ? '' : ' (unverified)'}
          </span>}
        </div>

        {won && <div className={styles.message}>You won! 🎉</div>}

        <div className={styles.columns}>
          {game.columns.map((column, columnIndex) => (
            <div
              key={columnIndex}
              className={styles.column}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, columnIndex)}
            >
              {column.map((card, cardIndex) => (
                <CardView
                  key={card.id}
                  image={cardImageUrl(card)}
                  alt={cardLabel(card)}
                  draggable={isMovableStack(column, cardIndex)}
                  columnIndex={columnIndex}
                  cardIndex={cardIndex}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>
          ))}
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.foundation} aria-label={`${game.completed.length} of ${RUNS_TO_WIN} runs completed`}>
            {game.completed.map((suit, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={cardImageUrl({ id: -1, suit, rank: 13, faceUp: true })} alt={`completed ${suit} run`} width={68} height={100} />
            ))}
          </div>
          <div
            className={styles.buttonWrapper}
            title={canDeal(game) || dealsLeft === 0 ? undefined : 'Fill every empty column before dealing'}
          >
            {[...Array(dealsLeft)].map((_, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={index}
                src={CARD_BACK_IMAGE}
                alt={`deal more cards (${dealsLeft} left)`}
                width={68}
                height={100}
                onClick={handleDeal}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
