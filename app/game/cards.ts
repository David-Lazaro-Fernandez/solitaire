export const SUITS = ['spades', 'hearths', 'clubs', 'diamonds'] as const
export type Suit = typeof SUITS[number]

export interface Card {
    id: number;
    suit: Suit;
    rank: number;
    faceUp: boolean;
}

const CARD_COLOR = 'black'
// One back for every card: a per-suit back would reveal what's under face-down cards
export const CARD_BACK_IMAGE = `/card_assets/Back_diamonds_${CARD_COLOR}.png`

const RANK_NAMES: Record<number, string> = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' }

function faceImage(suit: Suit, rank: number): string {
    return `/card_assets/${RANK_NAMES[rank] ?? rank}_${suit}_${CARD_COLOR}.png`
}

export function cardImageUrl(card: Card): string {
    return card.faceUp ? faceImage(card.suit, card.rank) : CARD_BACK_IMAGE
}

export function cardLabel(card: Card): string {
    return card.faceUp ? `${RANK_NAMES[card.rank] ?? card.rank} of ${card.suit}` : 'face-down card'
}

// Every image a card can show, so they can be fetched and decoded before the game starts
export function allCardImageUrls(): string[] {
    const urls = [CARD_BACK_IMAGE]
    SUITS.forEach(suit => {
        for (let rank = 1; rank <= 13; rank++) urls.push(faceImage(suit, rank))
    })
    return urls
}
