import fetch from 'node-fetch';
import { CardData, Card } from '../types';

const cardsEndpoint = 'https://api.skyweaver.net/rpc/SkyWeaverAPI/SearchCards';

const cardsBody = (page: number) => ({
    req: {
        criteria: {
            cardElement: [],
            cardManaCost: [],
            cardClass: [
                "AGY",
                "HRT",
                "STR",
                "WIS",
                "INT"
            ],
            searchText: ""
        }
    },
    page: {
        page,
        pageSize: 200
    }
});

type CardFile = {
    card: Card;
    balanceLatest: string,
    balanceConfirmed: string,
    balanceByType: string | null,
    createdAt: string | null
}[];

export async function getCards(numberOfPages: number) {
    const cardResults = await Promise.all(new Array(numberOfPages).fill(0).map((_, i) => fetch(cardsEndpoint, {
        method: 'post',
        body: JSON.stringify(cardsBody(i + 1)),
        headers: { 'Content-Type': 'application/json' }
    })));

    const cardBodies: { res: CardFile }[] = await Promise.all(cardResults.map(r => r.json()));

    return parseCardList(cardBodies.flatMap(r => r.res));
}

function parseCardList(cards: CardFile): CardData {
    return cards.map(c => c.card)
        .reduce((dict, c) => ({ ...dict, [c.id]: c }), {});
}