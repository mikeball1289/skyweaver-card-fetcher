const Discord = require('discord.js');
const client = new Discord.Client();
const fetch = require('node-fetch');

let cacheTime = new Date(0);
let cardMap = undefined;

async function fetchCardList() {
    if (cacheTime > new Date()) return;
    const cards = await fetch('http://www.skyweavermeta.com/trigger/cardData.json').then(d => d.json());
    cardMap = {};
    for (const id in cards) {
        cardMap[cards[id].name.toLowerCase().replace(/[^a-z]/g, '')] = {
            image: cards[id].imageURL.medium,
            name: cards[id].name,
            keywords: cards[id].keywords.map(w => w[0] + w.slice(1).toLowerCase()),
            description: cards[id].description,
            stats: `${cards[id].power}/${cards[id].health}`,
            type: cards[id].type,
        };
    }
    cacheTime = new Date(Date.now() - (1000 * 60 * 60));
}

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    await fetchCardList();
});

const regex = /\{\{(.+?)\}\}/g;

client.on('message', async msg => {
    let match = regex.exec(msg.content);
    if (match) {
        await fetchCardList();
        let response = [];
        do {
            response.push(match[1].toLowerCase().replace(/[^a-z]/g, ''));
        } while (match = regex.exec(msg.content));

        const cardData = response.map(cn => cardMap[cn]).filter(ci => ci);
        if (cardData.length > 0) {
            for (const data of cardData) {
                const embed = new Discord.MessageEmbed()
                    .setTitle(data.name)
                    .setURL(data.image)
                    .setDescription(data.keywords.join(', ') + '\n' + data.description + (data.type === 'UNIT' ? ('\n' + data.stats) : ''))
                    .setThumbnail(data.image);
                msg.channel.send(embed);
            }
        }
    }
});

client.login('Njg4NDU2MzEzNTk5OTUwOTky.Xm0nSg.ICK8pEiCBxdpmLf0P9GPyu3EQK0');