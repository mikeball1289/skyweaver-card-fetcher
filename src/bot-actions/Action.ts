import Discord from 'discord.js';

type TriggerDataResult = string[] | undefined;

export interface Action {
    triggerData(message: string): TriggerDataResult | Promise<TriggerDataResult>;
    process(params: string[], channel: Discord.TextChannel | Discord.DMChannel): void | Promise<void>;
}
