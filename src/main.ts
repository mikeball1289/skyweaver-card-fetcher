import Discord from 'discord.js';
import fs from 'fs';
import path from 'path';
import { CardMap, CardData } from './types';
import { Cacher } from './cache/Cacher';
import { CardLookupAction } from './bot-actions/CardLookupAction';
import { DeckPreviewAction } from './bot-actions/DeckPreviewAction';
import { Action } from './bot-actions/Action';
import { getCards } from './net/getCards';

const client = new Discord.Client();

async function fetchCardList() {
    const cards = await getCards(3);
    const cardMap: CardMap = {};
    for (const id in cards) {
        cardMap[cards[id].name.toLowerCase().replace(/[^a-z]/g, '')] = {
            image: cards[id].imageURL.medium,
            name: cards[id].name,
            keywords: cards[id].keywords.map((w: string) => w[0] + w.slice(1).toLowerCase()),
            description: cards[id].description,
            cost: cards[id].manaCost,
            stats: `${cards[id].power}/${cards[id].health}`,
            type: cards[id].type,
        };
    }
    return { cards, cardMap };
}

const cardCache = new Cacher(fetchCardList, 1000 * 60 * 60 * 6); // 6 hours in milliseconds
// const cache = new Cacher(fetchCardList, 1000);

client.on('ready', async () => {
    if (!client.user) throw new Error('Failed to log in');
    console.log(`Logged in as ${client.user.tag}!`);
    cardCache.get();
});

const actions: Action[] = [
    new CardLookupAction(cardCache),
    new DeckPreviewAction(cardCache),
];

client.on('message', async msg => {
    try {
        if (!msg.content || !msg.channel || !(msg.channel instanceof Discord.TextChannel)) return;
        for (const action of actions) {
            const trigger = await action.triggerData(msg.content);
            if (trigger) {
                await action.process(trigger, msg.channel);
                break;
            }
        }
    } catch (err) {
        console.log(err);
    }
});

client.login(fs.readFileSync(path.join(__dirname, '..', 'private.key.bak'), 'ascii').trim());
