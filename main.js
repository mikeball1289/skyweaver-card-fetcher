const Discord = require('discord.js');
const client = new Discord.Client();
const fetch = require('node-fetch');
const fs = require('fs');

let cacheTime = new Date(0);
let cardMap = undefined;

// Unused because I wasn't able to test this in my test server
// I think the bot needs to be in a server with these emotes?
// Not sure wasn't able to find documentation on it, something
// to look into though
// const costMap = {
//     [-1]: '<:xc:611596484445470753>',
//     [0]: '<:0c:611596016478716083>',
//     [1]: '<:1c:611594980737286149>',
//     [2]: '<:2c:611594980833624074>',
//     [3]: '<:3c:611594980775034882>',
//     [4]: '<:4c:611594980984619008>',
//     [5]: '<:5c:611594980489822211>',
//     [6]: '<:6c:611594980678696980>',
//     [7]: '<:7c:611594980628234240>',
//     [8]: '<:8c:611594980510924832>',
//     [9]: '<:9c:611594980582227982>',
// };

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
            cost: cards[id].manaCost,
            stats: `${cards[id].power}/${cards[id].health}`,
            type: cards[id].type,
        };
    }
    cacheTime = new Date(Date.now() + (1000 * 60 * 60));
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
                    .setTitle(`(${data.cost < 0 ? 'X' : data.cost}) ${data.name}`)
                    .setURL(data.image)
                    .setDescription(data.keywords.join(', ') + '\n' + data.description + (data.type === 'UNIT' ? ('\n' + data.stats) : ''))
                    .setThumbnail(data.image);
                msg.channel.send(embed);
            }
        }
    }
});

client.login(fs.readFileSync('private.key', 'ascii').trim());
