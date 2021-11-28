//FOR BUILDING EMBEDS EASILY REMEMBER https://autocode.com/tools/discord/embed-builder/
//FOR SLASH CM OPTIONS USE https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type

//#region REQUIRES
require('dotenv').config();
const { doesNotMatch } = require('assert');
const { Client, Intents, Interaction, DiscordAPIError } = require('discord.js');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );
const { SlashCommandBuilder } = require('@discordjs/builders');
//#endregion

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const dbFile = "./src/db.json";

var testGuild;
client.on('ready', () => {
    console.log(`BOT: ${client.user.tag} IS LOGGED IN AND READY`);
    //#region SLASH CMDS
    const TEST = false;
    const SET = true;
    const testGuildID = "882015119498940456";
    testGuild = client.guilds.cache.get(testGuildID);

    if(TEST){
        setCommands(true, testGuild);
    }else{
        if(SET){
            reloadCmds();
        }
    }
    //setCommands(commands, false);
    //#endregion
});

//#region ON ADD TO SERVER
client.on('guildCreate', guild => {
    guild.systemChannel.send(`Thanks for inviting me!`);
    setCommands(true, guild);
  });
//#endregion

//#region SLASH CMDS
client.on('interactionCreate', async (interaction) => {
    if(!interaction.isCommand()){
        return;
    }
    const { commandName, options } = interaction;

    db = JSON.parse(fs.readFileSync(dbFile, "utf8"));
    initDb(interaction);

    switch (commandName){
        case 'ping': case 'test':
            interaction.reply({
                content: `Latency is ${Date.now() - interaction.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`,
            });
            break;
        case 'pfp':
            let targ = options.getUser('target');
            let avatar = targ.avatarURL();
            if(avatar != null){
                const embed = new MessageEmbed()
                    .setImage(avatar)
                    .setTitle('Here you go:')
                    .setURL(avatar)
                interaction.reply({
                    content: 'Here you go: [link](' + avatar + ')',
                });
            }else{
                interaction.reply({
                    content: 'Could not find profile picture for ' + targ.username + '.',
                });
            }
            break;
        case 'joke':
            const jokeURL = 'https:\/\/v2.jokeapi.dev/joke/Any?blacklistFlags=religious,political,racist,sexist&type=single';
            $.getJSON(jokeURL, function(data) {
                interaction.reply({
                    content: data.joke,
                });
            });
            break;
        case 'invite':
            interaction.reply({
                content: 'Click [here](https:\/\/discord.com/api/oauth2/authorize?client_id=905945884108390491&permissions=8&redirect_uri=https%3A%2F%2Fdiscord.com&scope=bot%20applications.commands) to invite the bot to your server.',
            });
            break;
        case 'meme':
            var memeSub = 'memes';
            switch (Math.floor(Math.random() * 5)) {
                case 0:
                    memeSub = 'memes';
                    break;
                case 1:
                    memeSub = 'meme';
                    break;
                case 2:
                    memeSub = 'wholesomememes';
                    break;
                case 3:
                    memeSub = 'dankmemes';
                    break;
                case 4:
                    memeSub = 'programmerhumor';
                    break;
                default:
                    memeSub = 'memes';
                    break;
            }
            const memeURL = `https://api.reddit.com/r/${memeSub}/hot/.json`;
            var response;
            try {
                await $.getJSON(memeURL, function(data) {
                    response = data;
                });
                var postChildren = [];
                var index = response.data.children[Math.floor(Math.random() * (response.data.children.length-1)) + 1].data
                const isImage = index.post_hint === "image";
                const subRedditName = index.subreddit_name_prefixed;
                const title = index.title;
                const link = 'https://reddit.com' + index.permalink;
                const text = !isImage && index.selfText;
                const desc = `[${title}](${link})`;
                const img = index.preview.images[0].source.url.replace('&amp;', '&');
                
                
                const embed = new MessageEmbed()
                    .setTitle(subRedditName)
                    .setColor(9384170)
                    .setDescription(desc + (text ? `\n\n${text}` : ""))
                    .setURL(`https://reddit.com/${subRedditName}`)
                if(isImage){
                    embed.setImage(img);
                }
                interaction.reply({
                    content: 'Here you go: \n',
                    embeds: [ embed ],
                });
            } catch (error) {
                console.log(error)
            }
            break;
        case 'reddit':
            let sub = options.getString('subreddit');
            let subURL = `https://api.reddit.com/r/${sub}/hot/.json`;
            var response;
            try {
                await $.getJSON(subURL, function(data) {
                    response = data;
                });
                var postChildren = [];
                var index = response.data.children[Math.floor(Math.random() * (response.data.children.length-1)) + 1].data
                let isImage = index.post_hint === "image";
                let subRedditName = index.subreddit_name_prefixed;
                let title = index.title;
                let link = 'https://reddit.com' + index.permalink;
                let text = !isImage && index.selfText;
                let desc = `[${title}](${link})`;
                let img = index.preview.images[0].source.url.replace('&amp;', '&');
                
                
                var embed = new MessageEmbed()
                    .setTitle(subRedditName)
                    .setColor(9384170)
                    .setDescription(desc + (text ? `\n\n${text}` : ""))
                    .setURL(`https://reddit.com/${subRedditName}`)
                if(isImage){
                    embed.setImage(img);
                }
                interaction.reply({
                    content: 'Here you go: \n',
                    embeds: [ embed ],
                });
            } catch (error) {
                interaction.reply({
                    content: 'Sorry, there seems to have been a problem. Try checking if the subreddit is spelled right, or contact the devs.',
                    ephemeral: true,
                });
            }
            break;
        case 'info':
            break;
            default:
            interaction.reply({
                content: 'There seems to be an issue, I don\'t recognize this command.',
                ephemeral: true,
            });
            break;
    }
});
//#endregion

function initDb(inter){
    if(!db[inter.member.user.id]){
        db[inter.member.user.id] = {
            name: inter.member.user.tag,
            points: 0,
        }
        fs.writeFile(dbFile, JSON.stringify(db), (x) => {
            if (x) console.error(x)
          });
    }
}

function setCommands(single, cmdGuild){
    let commands;
    if(single){
        commands = cmdGuild.commands;
    }else{
        commands = client.application?.commands;
    }
    commands.create({name: 'ping',
        description: 'Gets latency in ms.',
    });
    commands.create({name: 'test',
        description: 'Sends the bot server a test ping.',
    });
    commands.create({name: 'pfp',
        description: 'Get the profile picture of a user.',
        options: [{
            name: 'target',
            description: 'user',
            required: true,
            type: 6
        }],
    });
    commands.create({name: 'joke',
        description: 'Tells a joke.',
    });
    commands.create({name: 'invite',
        description: 'Gives the bot invite link.',
    });
    commands.create({name: 'meme',
        description: 'Sends a meme!',
    });
    commands.create({name: 'reddit',
        description: 'Get a post from a subreddit.',
        options: [{
            name: 'subreddit',
            description: 'Do not include \"r/\"',
            required: true,
            type: 3,
        }],
    });
    
}

function reloadCmds(){
    client.guilds.cache.forEach(Iguild => {
        setCommands(true, Iguild);
    });
}

client.login(process.env.BOT_TOKEN);