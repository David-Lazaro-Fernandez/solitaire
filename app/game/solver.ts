import { SUITS } from './cards'
import { COLUMN_COUNT, GameState, RUN_LENGTH, RUNS_TO_WIN } from './spider'

// Full-information solver: it knows every face-down card and the stock order, and searches
// for a sequence of legal moves that wins. Used to reject deals that can't be finished.
//
// Cards are encoded as numbers (suit * 13 + rank - 1). Face-down cards always sit at the
// bottom of a column, so each column just tracks how many of its cards are still hidden.

interface SolverState {
    cols: number[][];
    down: number[];
    stockPos: number;
    done: number;
}

export type Move = { from: number, index: number, to: number } | { deal: true }

const rankOf = (code: number) => code % RUN_LENGTH + 1
const suitOf = (code: number) => Math.floor(code / RUN_LENGTH)
const follows = (lower: number, upper: number) => suitOf(lower) === suitOf(upper) && rankOf(lower) === rankOf(upper) - 1

function encode(state: GameState): { start: SolverState, stock: number[] } {
    const code = (card: { suit: string, rank: number }) =>
        SUITS.indexOf(card.suit as typeof SUITS[number]) * RUN_LENGTH + card.rank - 1
    return {
        start: {
            cols: state.columns.map(column => column.map(code)),
            down: state.columns.map(column => column.filter(card => !card.faceUp).length),
            stockPos: 0,
            done: state.completed.length,
        },
        stock: state.stock.map(code),
    }
}

// Columns are interchangeable, so sorting them merges positions that differ only by column order
function hash(s: SolverState): string {
    return s.cols.map((col, i) => s.down[i] + ':' + col.join(',')).sort().join('|') + '#' + s.stockPos
}

function movableStart(s: SolverState, c: number): number {
    const col = s.cols[c]
    let start = col.length - 1
    while (start - 1 >= s.down[c] && follows(col[start], col[start - 1])) start--
    return start
}

// Higher is closer to winning: completed runs, revealed cards, empty columns and same-suit links
function evaluate(s: SolverState): number {
    let score = s.done * 1000 - s.stockPos * 5
    for (let c = 0; c < COLUMN_COUNT; c++) {
        const col = s.cols[c]
        if (col.length === 0) score += 60
        score -= s.down[c] * 20
        for (let i = Math.max(s.down[c], 1); i < col.length; i++) {
            if (follows(col[i], col[i - 1])) score += 10
            else if (rankOf(col[i]) === rankOf(col[i - 1]) - 1) score += 3
        }
    }
    return score
}

// Only whole movable stacks move (splitting a same-suit run never gets you anything a whole
// move doesn't), and a stack already sitting on a natural parent only moves to improve things
function generateMoves(s: SolverState): Move[] {
    const moves: Move[] = []
    for (let from = 0; from < COLUMN_COUNT; from++) {
        const col = s.cols[from]
        if (col.length === 0) continue
        const index = movableStart(s, from)
        const card = col[index]
        const improvesSource = index === 0 || index === s.down[from]
        const onNaturalParent = index > s.down[from] && rankOf(col[index - 1]) === rankOf(card) + 1
        let triedEmpty = false
        for (let to = 0; to < COLUMN_COUNT; to++) {
            if (to === from) continue
            const target = s.cols[to]
            if (target.length === 0) {
                // All empty columns are equivalent, and moving a whole column into one is pointless
                if (triedEmpty || index === 0) continue
                triedEmpty = true
                moves.push({ from, index, to })
                continue
            }
            const top = target[target.length - 1]
            if (rankOf(top) !== rankOf(card) + 1) continue
            const sameSuit = suitOf(top) === suitOf(card)
            if (onNaturalParent && !improvesSource && !sameSuit) continue
            moves.push({ from, index, to })
        }
    }
    return moves
}

function orderedMoves(s: SolverState, stock: number[]): { move: Move, next: SolverState }[] {
    const results = generateMoves(s).map(move => {
        const next = apply(s, move, stock)!
        return { move, next, score: evaluate(next) }
    }).sort((a, b) => b.score - a.score)
    // Dealing is a last resort: only legal with no empty columns
    if (s.stockPos < stock.length && s.cols.every(col => col.length > 0)) {
        const deal: Move = { deal: true }
        results.push({ move: deal, next: apply(s, deal, stock)!, score: -Infinity })
    }
    return results
}

function collect(s: SolverState, c: number): void {
    const col = s.cols[c]
    const start = col.length - RUN_LENGTH
    if (start < s.down[c] || rankOf(col[start]) !== RUN_LENGTH) return
    for (let i = start + 1; i < col.length; i++) if (!follows(col[i], col[i - 1])) return
    s.cols[c] = col.slice(0, start)
    s.done++
    reveal(s, c)
}

function reveal(s: SolverState, c: number): void {
    if (s.down[c] > 0 && s.down[c] === s.cols[c].length) s.down[c]--
}

function apply(s: SolverState, move: Move, stock: number[]): SolverState | null {
    const next: SolverState = { cols: [...s.cols], down: [...s.down], stockPos: s.stockPos, done: s.done }
    if ('deal' in move) {
        if (next.stockPos + COLUMN_COUNT > stock.length) return null
        for (let c = 0; c < COLUMN_COUNT; c++) next.cols[c] = [...next.cols[c], stock[next.stockPos + c]]
        next.stockPos += COLUMN_COUNT
        for (let c = 0; c < COLUMN_COUNT; c++) collect(next, c)
        return next
    }
    const moving = s.cols[move.from].slice(move.index)
    next.cols[move.from] = s.cols[move.from].slice(0, move.index)
    reveal(next, move.from)
    next.cols[move.to] = [...s.cols[move.to], ...moving]
    collect(next, move.to)
    return next
}

export interface SolveResult {
    solved: boolean;
    explored: number;
    // The winning line, for tests that replay it through the real game rules
    solution: Move[];
}

// Depth-first search, most promising positions first, with a visited set, capped at `maxStates`.
// "Not solved" can mean unwinnable or just over budget; either way the deal is rejected.
export function solve(state: GameState, maxStates: number): SolveResult {
    const { start, stock } = encode(state)
    const visited = new Set<string>([hash(start)])
    const stack: { children: { move: Move, next: SolverState }[], next: number }[] = [
        { children: orderedMoves(start, stock), next: 0 },
    ]
    const path = () => stack.map(frame => frame.children[frame.next - 1].move)
    while (stack.length > 0) {
        if (visited.size >= maxStates) return { solved: false, explored: visited.size, solution: [] }
        const frame = stack[stack.length - 1]
        if (frame.next >= frame.children.length) {
            stack.pop()
            continue
        }
        const { next } = frame.children[frame.next++]
        if (next.done === RUNS_TO_WIN) return { solved: true, explored: visited.size, solution: path() }
        const key = hash(next)
        if (visited.has(key)) continue
        visited.add(key)
        stack.push({ children: orderedMoves(next, stock), next: 0 })
    }
    return { solved: false, explored: visited.size, solution: [] }
}

interface BeamNode {
    state: SolverState;
    parent: BeamNode | null;
    move: Move | null;
    score: number;
}

// Beam search: expand every position on the current level, keep only the `width` best.
export function solveBeam(state: GameState, width: number, maxDepth = 1000): SolveResult {
    const { start, stock } = encode(state)
    const visited = new Set<string>([hash(start)])
    let level: BeamNode[] = [{ state: start, parent: null, move: null, score: evaluate(start) }]
    const pathTo = (node: BeamNode) => {
        const moves: Move[] = []
        for (let n: BeamNode | null = node; n && n.move; n = n.parent) moves.unshift(n.move)
        return moves
    }
    for (let depth = 0; depth < maxDepth && level.length > 0; depth++) {
        const candidates: BeamNode[] = []
        for (const node of level) {
            for (const { move, next } of orderedMoves(node.state, stock)) {
                const child = { state: next, parent: node, move, score: evaluate(next) }
                if (next.done === RUNS_TO_WIN) return { solved: true, explored: visited.size, solution: pathTo(child) }
                const key = hash(next)
                if (visited.has(key)) continue
                visited.add(key)
                candidates.push(child)
            }
        }
        level = candidates.sort((a, b) => b.score - a.score).slice(0, width)
    }
    return { solved: false, explored: visited.size, solution: [] }
}
