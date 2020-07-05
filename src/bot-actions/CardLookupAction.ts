import Discord from 'discord.js';
import { Action } from './Action';
import { Cacher } from '../cache/Cacher';
import { CardData, CardMap } from '../types';
import { randomBytes } from 'crypto';

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

const cardFetchRegex = /(?<=\{\{).+?(?=\}\})/g;

export class CardLookupAction implements Action {
    constructor(private cardCache: Cacher<{ cards: CardData, cardMap: CardMap }>) { }

    triggerData(message: string) {
        return message.match(cardFetchRegex)?.slice();
    }

    async process(params: string[], channel: Discord.TextChannel | Discord.DMChannel) {
        const { cardMap } = await this.cardCache.get();

        const messages = params
            .map(cn => cn.toLowerCase().replace(/[^a-z]/g, ''))
            .map(cn => cardMap[cn])
            .filter(ci => ci)
            .slice(0, 5) // only take the first 5 cards
            .map(data => new Discord.MessageEmbed()
                .setTitle(`${costMap[data.cost]} ${data.name}`)
                .setURL(data.image)
                .setDescription(data.keywords.join(', ') + '\n' + data.description + (data.type === 'UNIT' ? ('\n' + data.stats) : ''))
                .setThumbnail(`${data.image}?${randomBytes(16).toString('hex')}`)); // append a cache buster to the image)
        
        for (const message of messages) {
            channel.send(message);
        }
    }
}