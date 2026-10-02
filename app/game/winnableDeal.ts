import { newGame, SuitCount } from './spider'
import { solve, solveBeam } from './solver'

export interface WinnableDeal {
    seed: number;
    attempts: number;
    verified: boolean;
}

// Shuffles until the solver finds a full solution. Depth-first search is fastest on one-suit
// deals and beam search on two- and four-suit ones, so each deal gets a quick try of both.
export function findWinnableDeal(suitCount: SuitCount, nextSeed: () => number, maxAttempts = 100): WinnableDeal {
    let seed = nextSeed()
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const state = newGame(seed, suitCount)
        if (solve(state, 5000).solved || solveBeam(state, 50).solved) {
            return { seed, attempts: attempt, verified: true }
        }
        seed = nextSeed()
    }
    return { seed, attempts: maxAttempts, verified: false }
}
