import Discord from 'discord.js';

type PlainMessage = { message: string, options: Discord.MessageAttachment };
type ProcessResult = Discord.MessageEmbed | PlainMessage | (Discord.MessageEmbed | PlainMessage)[] | undefined;
type TriggerDataResult = string[] | undefined;

export interface Action {
    triggerData(message: string): TriggerDataResult | Promise<TriggerDataResult>;
    process(params: string[], channel: Discord.TextChannel | Discord.DMChannel): void | Promise<void>;
}
