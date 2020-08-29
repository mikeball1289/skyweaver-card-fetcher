import Discord from 'discord.js';
import { Action } from './Action';

const infoRegex = /^!skybot/

export class InfoAction implements Action {
    constructor() { }

    triggerData(message: string) {
        return message.match(infoRegex)?.slice();
    }

    async process(params: string[], channel: Discord.TextChannel | Discord.DMChannel) {
        await channel.send(`On September 12th my server is getting shut down and I'll stop functioning. If you want to keep me in your server you can self-host me, all of my code is at https://github.com/mikeball1289/skyweaver-card-fetcher.`);
    }
}