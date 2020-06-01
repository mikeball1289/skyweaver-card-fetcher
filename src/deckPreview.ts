import { CardData } from './types';
import { decode } from 'bs58';

export interface Deck {
    prisms: string;
    cardIds: number[];
}

export interface DeckList {
    url: string;
    cards: string[];
}

export function generateDeckList(deckString: string, rawCards: CardData): DeckList | undefined {
    const deck = parseDeckString(deckString);
    if (!deck) return undefined;
    try {
        const url = `https://beta.skyweaver.net/items/deck/${deck.prisms}/${deckString}`;
        const cards = deck.cardIds
            .filter(id => id in rawCards)
            .map(id => rawCards[id])
            .sort((a, b) => a.manaCost - b.manaCost)
            .map(card => `(${card.manaCost}) ${card.name}`);
        return { url, cards };
    } catch (err) {
        return undefined;
    }
}

function parseDeckString(deckString: string): Deck | undefined {
    if (!deckString.startsWith('SWx') || deckString.slice(6, 8) !== '01') return undefined;
    try {
        return {
            prisms: deckString.slice(3, 6),
            cardIds: decode(deckString.slice(8)).toString().split(',').map(n => parseInt(n)),
        };
    } catch (err) {
        return undefined;
    }
}