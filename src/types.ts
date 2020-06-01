export interface Card {
    id: number;
    name: string;
    description: string;
    asset: string;
    class: string;
    element: string;
    type: string;
    manaCost: number;
    power: number;
    health: number;
    attachedSpellID: number;
    keywords: string[];
    status: string;
    imageURL: {
        small: string;
        medium: string;
        large: string;
    }
}

export interface MiniCard {
    image: string,
    name: string,
    keywords: string[],
    description: string,
    cost: number,
    stats: string,
    type: string,
}

export interface CardData {
    [cardId: number]: Card;
}

export interface CardMap {
    [cardName: string]: MiniCard;
}