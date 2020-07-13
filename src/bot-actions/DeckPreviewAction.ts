import Discord from 'discord.js';
import { Cacher } from '../cache/Cacher';
import { Action } from './Action';
import { CardData, CardMap } from '../types';
import { generateDeckListImage } from '../deckPreview';
import { unlink } from 'fs';

const deckPreviewRegex = /(?<=^!deck[\n ]+)SWx.+/

async function deleteFile(filename: string) {
    return new Promise((resolve, reject) => {
        unlink(filename, err => {
            if (err) reject(err);
            resolve();
        });
    });
}

export class DeckPreviewAction implements Action {
    constructor(private cardCache: Cacher<{ cards: CardData, cardMap: CardMap }>) { }

    triggerData(message: string) {
        return message.match(deckPreviewRegex)?.slice();
    }

    async process(params: string[], channel: Discord.TextChannel | Discord.DMChannel) {
        if (!(channel instanceof Discord.TextChannel)) {
            return;
        }
        
        const { cards } = await this.cardCache.get();
        const deckstring = params[0];
        const reply = await generateDeckListImage(deckstring, cards);

        if (!reply) return;

        await channel.send(new Discord.MessageEmbed()
            .setTitle('Build this deck!')
            .setURL(reply.url)
            .attachFiles([reply.fileName])
            .setImage(`attachment://${reply.fileName.split('/').slice(-1)[0]}`));

        await deleteFile(reply.fileName);
    }
}