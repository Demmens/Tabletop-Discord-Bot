const { Command, Argument } = require("discord-akairo");
const config = require("../../config.js");
const Discord = require("discord.js");
const RP_COLOUR = '#206694';
let games = [];

class RpJoinCommand extends Command {
	constructor() {
		super("rpJoin", {
			aliases: ["rpJoin"]
		});
	}
	*args(message){
		let gamesStr = '';
		let x = 0;

		for (let [_,chnl] of message.guild.channels.cache){ //Search channels
			if (chnl.name == 'active-games' && chnl.parent.name.toUpperCase() == 'ROLEPLAY'){//Find the games
				for (let [_,msg] of chnl.messages.cache){

					let inGame = false;
					for (let field of msg.embeds[0].fields){ //Find if they're already in the game
						if (field.name.startsWith('Players') || field.name.startsWith('GM') ){ 
							if (field.value.search(message.author) != -1){
								inGame = true;
							}
						}
					}
					if (!inGame){
						games.push(msg); //Create table containing all games messages
						x++
						gamesStr += `${x} - ${msg.embeds[0].title}\n`
					}
				}
			}
		}
		if (games.length!=0){
			const gameName = yield { 
				type: Argument.range('number',0,games.length,true),
				prompt: {
					start: message => {
					const embed = new Discord.MessageEmbed()
					.setTitle(`Which game do you wish to join?`)
					.setDescription(gamesStr)
					.setFooter(`type 'cancel' to cancel`);
					return{embed};
					},
					retry: message => `${message.author} please enter a valid number.`,
					prompt: true
				}

			}

			return {gameName};
		}
		else{ return message.channel.send(`${message.author} There are currently no available games for you to join. Try again later!`)}
	}
	async exec(message, args) {
		if (games.length != 0){
			let embed = games[args.gameName-1].embeds[0];

			for (let i of embed.fields){
				let split = i.name.split(" ")
				if (split[0] == "Players"){ //Split[1] = (x/n), x = current players, n = max players.
					split = split[1].split(/\D/);
					let cur = parseInt(split[1]);
					let tot = parseInt(split[2]);

					if (cur >= tot){
						return message.channel.send(`There is no more space in this game. The gm may allow an extra player at their own disgression if asked.`);
					} else {

						cur++;
						let val 
						if (i.value == 'No Current Players'){
							val = message.author;
						}else{
							val = i.value+=`\n${message.author}`
						}
						let name = `Players (${cur}/${tot})`;
						let emb = new Discord.MessageEmbed()
						emb = embed;
						emb.fields[1].name = name;
						emb.fields[1].value = val;
						games[args.gameName-1].edit(emb)
					}
				}
			}

			for (let [_,role] of message.guild.roles.cache){
				if (role.name == embed.title){
					message.member.roles.add(role);
					return message.channel.send(`${message.author} Successfully joined game: '${role.name}'.`);
				}
			}
		}
	}
}

module.exports = RpJoinCommand;