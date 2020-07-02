import Discord from 'discord.js';
import fetch from 'node-fetch';
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { CardMap } from './types';
import { generateDeckListImage } from './deckPreview';
import { Cacher } from './cache/Cacher';

const client = new Discord.Client();

const costMap: { [cost: number]: string } = {
    [-1]: '<:xc:611596484445470753>',
    [0]: '<:0c:611596016478716083>',
    [1]: '<:1c:611594980737286149>',
    [2]: '<:2c:611594980833624074>',
    [3]: '<:3c:611594980775034882>',
    [4]: '<:4c:611594980984619008>',
    [5]: '<:5c:611594980489822211>',
    [6]: '<:6c:611594980678696980>',
    [7]: '<:7c:611594980628234240>',
    [8]: '<:8c:611594980510924832>',
    [9]: '<:9c:611594980582227982>',
    [10]: '(10)',
    [11]: '(11)',
};

async function fetchCardList() {
    const cards = await fetch('http://www.skyweavermeta.com/trigger/cardData.json').then(d => d.json());
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

const cardCache = new Cacher(fetchCardList, 1000 * 60 * 60);
// const cache = new Cacher(fetchCardList, 1000);

client.on('ready', async () => {
    if (!client.user) throw new Error('Failed to log in');
    console.log(`Logged in as ${client.user.tag}!`);
    cardCache.get();
});

const regex = /\{\{(.+?)\}\}/g;

client.on('message', async msg => {
    if (!msg.content || !msg.channel) return;
    let match = regex.exec(msg.content);
    if (match) {
        const { cardMap } = await cardCache.get();
        let response = [];
        do {
            response.push(match[1].toLowerCase().replace(/[^a-z]/g, ''));
        } while (match = regex.exec(msg.content));

        const cardData = response.map(cn => cardMap[cn]).filter(ci => ci).slice(0, 5); // only take the first 5 cards
        if (cardData.length > 0) {
            for (const data of cardData) {
                const embed = new Discord.MessageEmbed()
                    .setTitle(`${costMap[data.cost]} ${data.name}`)
                    .setURL(data.image) // append a cache buster to the image
                    .setDescription(data.keywords.join(', ') + '\n' + data.description + (data.type === 'UNIT' ? ('\n' + data.stats) : ''))
                    .setThumbnail(`${data.image}?${crypto.randomBytes(16).toString('hex')}`);
                msg.channel.send(embed);
            }
        }
    } else if (msg.content.startsWith('!deck ') || msg.content.startsWith('!deck\n')) {
        const { cards } = await cardCache.get();
        const deckstring = msg.content.replace('\n', ' ').replace('!deck ', '');
        const reply = await generateDeckListImage(deckstring, cards);
        if (!reply) return;
        const embed = new Discord.MessageEmbed()
            .setTitle('Build this deck!')
            .setURL(reply.url)
            .attachFiles([reply.fileName])
            .setImage(`attachment://${reply.fileName.split('/').slice(-1)[0]}`);
        msg.channel.send(embed);
    }
});

client.login(fs.readFileSync(path.join(__dirname, '..', 'private.key'), 'ascii').trim());
