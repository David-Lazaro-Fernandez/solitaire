import { Card, SUITS, Suit } from './cards'
import { createRng, shuffle } from './random'

export type SuitCount = 1 | 2 | 4

export const COLUMN_COUNT = 10
export const RUN_LENGTH = 13
export const RUNS_TO_WIN = 8
const TABLEAU_SIZE = 54

export interface GameState {
    columns: Card[][];
    stock: Card[];
    completed: Suit[];
}

export interface MoveResult {
    state: GameState;
    completedRun: boolean;
}

// Spider uses 104 cards: 8 full ace-to-king runs spread evenly over the chosen suits
export function createDeck(suitCount: SuitCount): Card[] {
    const suits = SUITS.slice(0, suitCount)
    const cards: Card[] = []
    for (let run = 0; run < RUNS_TO_WIN; run++) {
        const suit = suits[run % suitCount]
        for (let rank = 1; rank <= RUN_LENGTH; rank++) {
            cards.push({ id: cards.length, suit, rank, faceUp: false })
        }
    }
    return cards
}

// 54 cards to the tableau (6 in the first four columns, 5 in the rest), 50 left for 5 deals of 10
export function newGame(seed: number, suitCount: SuitCount): GameState {
    const deck = shuffle(createDeck(suitCount), createRng(seed))
    const columns: Card[][] = Array.from({ length: COLUMN_COUNT }, () => [])
    deck.slice(0, TABLEAU_SIZE).forEach((card, i) => columns[i % COLUMN_COUNT].push(card))
    return {
        columns: columns.map(revealTop),
        stock: deck.slice(TABLEAU_SIZE),
        completed: [],
    }
}

function revealTop(column: Card[]): Card[] {
    const top = column.at(-1)
    if (!top || top.faceUp) return column
    return [...column.slice(0, -1), { ...top, faceUp: true }]
}

// A stack can be picked up if it is face-up and descends by one in a single suit
export function isMovableStack(column: Card[], index: number): boolean {
    if (index < 0 || index >= column.length || !column[index].faceUp) return false
    for (let i = index + 1; i < column.length; i++) {
        if (column[i].suit !== column[i - 1].suit || column[i].rank !== column[i - 1].rank - 1) return false
    }
    return true
}

export function canMove(state: GameState, from: number, index: number, to: number): boolean {
    if (from === to || !isMovableStack(state.columns[from], index)) return false
    const target = state.columns[to].at(-1)
    // Empty columns take anything; otherwise any suit one rank higher
    return !target || target.rank === state.columns[from][index].rank + 1
}

export function moveStack(state: GameState, from: number, index: number, to: number): MoveResult | null {
    if (!canMove(state, from, index, to)) return null
    const columns = [...state.columns]
    const moving = columns[from].slice(index)
    columns[from] = revealTop(columns[from].slice(0, index))
    columns[to] = [...columns[to], ...moving]
    return removeCompletedRuns({ ...state, columns }, [to])
}

export function canDeal(state: GameState): boolean {
    return state.stock.length >= COLUMN_COUNT && state.columns.every(column => column.length > 0)
}

export function dealRow(state: GameState): MoveResult | null {
    if (!canDeal(state)) return null
    const dealt = state.stock.slice(0, COLUMN_COUNT)
    const columns = state.columns.map((column, i) => [...column, { ...dealt[i], faceUp: true }])
    return removeCompletedRuns(
        { ...state, columns, stock: state.stock.slice(COLUMN_COUNT) },
        columns.map((_, i) => i),
    )
}

// A king-to-ace run of one suit at the end of a column goes to the foundation
function removeCompletedRuns(state: GameState, columnIndexes: number[]): MoveResult {
    const columns = [...state.columns]
    const completed = [...state.completed]
    let completedRun = false
    columnIndexes.forEach(c => {
        const column = columns[c]
        const start = column.length - RUN_LENGTH
        if (start >= 0 && column[start].rank === RUN_LENGTH && isMovableStack(column, start)) {
            completed.push(column[start].suit)
            columns[c] = revealTop(column.slice(0, start))
            completedRun = true
        }
    })
    return { state: { ...state, columns, completed }, completedRun }
}

export function isWon(state: GameState): boolean {
    return state.completed.length === RUNS_TO_WIN
}

export function remainingDeals(state: GameState): number {
    return Math.floor(state.stock.length / COLUMN_COUNT)
}
