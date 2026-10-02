// Seeded PRNG (mulberry32): the same seed always produces the same deal,
// which lets the solver verify a deal and the page rebuild it from just the seed
export function createRng(seed: number): () => number {
    let a = seed >>> 0
    return () => {
        a = (a + 0x6D2B79F5) >>> 0
        let t = a
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

// Unbiased Fisher-Yates shuffle; returns a new array
export function shuffle<T>(items: readonly T[], rng: () => number): T[] {
    const result = [...items]
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]]
    }
    return result
}

export function randomSeed(): number {
    return crypto.getRandomValues(new Uint32Array(1))[0]
}
