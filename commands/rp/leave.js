const { Command, Argument } = require("discord-akairo");
const config = require("../../config.js");
const Discord = require("discord.js");
const RP_COLOUR = '#206694';

class RpLeaveCommand extends Command {
	constructor() {
		super("rpLeave", {
			aliases: ["rpLeave"]
		});
	}
	*args(message){
		let gamesStr = '';
		let x = 0;
		let games = [];

		for (let [_,chnl] of message.guild.channels.cache){ //Search channels
			if (chnl.name == 'active-games' && chnl.parent.name.toUpperCase() == 'ROLEPLAY'){//Find the games
				for (let [_,msg] of chnl.messages.cache){

					let inGame = false;
					for (let field of msg.embeds[0].fields){ //Find if they're in the game
						if (field.name.startsWith('Players')){ 
							if (field.value.search(message.author) != -1){
								inGame = true;
							}
						}
					}
					if (inGame){
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
					.setTitle(`Which game do you wish to leave?`)
					.setDescription(gamesStr);
					return{embed};
					},
					retry: message => `${message.author} please enter a valid number.`,
					prompt: true
				}

			}

			return {gameName, games};
		}
		else{ return message.channel.send(`${message.author} You are not in any games.`)}
	}
	async exec(message, args) {
		let games = args.games;
		if (games.length != 0){
			let embed = games[args.gameName-1].embeds[0];

			for (let i of embed.fields){
				let split = i.name.split(" ")
				if (split[0] == "Players"){ //Split[1] = (x/n), x = current players, n = max players.
					split = split[1].split(/\D/);
					let cur = parseInt(split[1]);
					let tot = parseInt(split[2]);
					cur--;
					let val = i.value.replace(`${message.author}\n`,''); //make sure to clear the new line aswell
					val = val.replace(`${message.author}`,''); //if there was no new line after, then it hasn't cleared the username yet
					if (val == ''){
						val = 'No Current Players';
					}

					let name = `Players (${cur}/${tot})`;
					let emb = new Discord.MessageEmbed()
					emb = embed;
					emb.fields[1].name = name;
					emb.fields[1].value = val;
					games[args.gameName-1].edit(emb);
					
				}
			}

			for (let [_,role] of message.member.roles.cache){
				if (role.name == embed.title){
					message.member.roles.remove(role);
					return message.channel.send(`${message.author} Successfully left game: '${role.name}'.`);
				}
			}
		}
	}
}

module.exports = RpLeaveCommand;