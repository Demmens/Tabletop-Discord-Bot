const { Command } = require("discord-akairo");
const config = require("../../config.js");
const Discord = require("discord.js");


class CreateGameMessagesCommand extends Command {
	constructor() {
		super("rpCreateGameMessages", {
			aliases: ["rpCreateGameMessages"],	
		});
	}

	async exec(message, args) {
		const gld = message.guild
		const RP_COLOUR = '#206694';
		if (message.member.hasPermission('ADMINISTRATOR')){
			for (let [_,rl] of gld.roles.cache){
				if (rl.hexColor == RP_COLOUR && rl.name.slice(rl.name.length-3) == ' GM'){ //Find all the GM roles in the server
					let gmRl = rl;
					let plRl;
					let plArr = []; //Create array to hold all the players of the corresponding game
					let plStr = ""; //String list of players in the game
					let gm; //Member of the GM

					for (let [_,rol] of gld.roles.cache){ //Now find corresponding regular role
						if (rol.name+' GM' == gmRl.name){
							plRl = rol;
						}
					}

					for (let [_,mem] of plRl.members){ //Fill table with everyone in the game
						plArr.push(mem);
					}

					if (plArr.length == 0){ //If the game is empty
						plStr = "No Current Players";
					} else{
						for (let i of plArr){ //Otherwise create the list of players
							plStr += `${i.user}\n`;
						}
					}

					for (let [_,mem] of gmRl.members){
						gm = mem;
					}

					const embed = new Discord.MessageEmbed()
					.setColor(config.colour)
					.setTitle(plRl.name)
					.setDescription('..')
					.addFields([
					{
						"name": `GM`,
						"value": gm.user
					},
					{
						"name": `Players (${plArr.length}/${plArr.length})`,
						"value": plStr
					},
					{
						"name": `System`,
						"value": `..`
					},
					{
						"name": `Date & Time`,
						"value": `..`
					}
					])
					for (let [_,chnl] of gld.channels.cache){
						if (chnl.name == 'active-games' && chnl.parent.name.toUpperCase() == 'ROLEPLAY'){chnl.send(embed);}
					}
				}
			}

			return message.channel.send(`Created game messages.`);
		} else {
			return message.channel.send(`You do not have the correct permissions to run this command`)
		}
	}
}

module.exports = CreateGameMessagesCommand;