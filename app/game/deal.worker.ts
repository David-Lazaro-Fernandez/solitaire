import { randomSeed } from './random'
import { SuitCount } from './spider'
import { findWinnableDeal } from './winnableDeal'

// Solving can take a second or two for four suits, so it runs off the main thread
self.onmessage = (e: MessageEvent<{ suitCount: SuitCount }>) => {
    self.postMessage(findWinnableDeal(e.data.suitCount, randomSeed))
}
