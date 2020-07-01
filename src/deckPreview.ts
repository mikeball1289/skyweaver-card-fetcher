import nodeHtmlToImage from 'node-html-to-image';
import pug from 'pug';
import { CardData } from './types';
import { decode } from 'bs58';
import { join } from 'path';
import { randomBytes } from 'crypto';

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

const render = pug.compileFile(join(__dirname, '..', 'templates', 'preview.pug'));

export async function generateDeckListImage(deckString: string, rawCards: CardData): Promise<{ url: string, fileName: string } | undefined> {
    const deck = parseDeckString(deckString);
    if (!deck) return undefined;
    if (deck.cardIds.length < 1 || deck.cardIds.length > 30) return undefined;
    const url = `https://beta.skyweaver.net/items/deck/${deck.prisms}/${deckString}`;
    const fileName = `./deckImages/image${randomBytes(16).toString('hex')}.png`;
    const cards = deck.cardIds
        .filter(id => id in rawCards)
        .map(id => rawCards[id])
        .sort((a, b) => a.manaCost - b.manaCost);

    const html = render({ cards, width: Math.ceil(cards.length / 10) });
    await nodeHtmlToImage({
        output: fileName,
        html,
    });

    return { url, fileName };
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