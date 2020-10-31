const { Command, Argument } = require("discord-akairo");
const fs = require('fs');
const Discord = require("discord.js");
const f = require('../../functions.js');
const f2 = require('./functions.js');

class IGCultistCommand extends Command {

	constructor() {
		super("Cultists", {
			aliases: ["Cultists"],
			description: "Display and search through your cult."
		});
	}
	*args(message){
		try {
			let jsonString = fs.readFileSync('IdleGame/stats.json');
			const players = JSON.parse(jsonString);
			const us = message.author;
			const mem = message.member;
			let pl;

			for (let ply of players){
				if (ply.name == message.author.toString()){
					pl = ply;
				}
			}

			let cultist; //Create all args here, so we can return them all at once and save a lot of hassle.
			let action;
			let rename;
			let confirmSell;

			let cultistStr = "";
			let x = 0;

			for (let cult of pl.cultists){
				x++;
				cultistStr += `${x} - ${cult.name}\n`;
			}

			if (pl.cultists.toString() != [].toString()){
				cultist = yield{
					type: Argument.range('integer',0,pl.cultists.length,true),
					prompt: {
						start: message => {
							let emb = new Discord.MessageEmbed()
							.setTitle(`${mem.displayName}'s Cultists`)
							.setDescription(cultistStr)
							.setFooter("Type 'cancel' to cancel");
							return emb;
						},
						retry: message => `${us} Please enter a valid number.`,
						prompt: true					
					}
				}
				let cultistNum = cultist-1
				cultist = pl.cultists[cultistNum];

				action = yield{
					type: Argument.range('integer',0,6),
					prompt: {
						start: message => {
							let emb = new Discord.MessageEmbed()
							.setTitle(cultist.name)
							.setDescription(`${f2.createCultistStatString(cultist)}\nSell Price: £${cultist.value/2}\n-------------------------\n1 - Give Job\n2 - Rename\n3 - Upgrade\n4 - Equip\n5 - Sell`)
							.setFooter("Type 'cancel' to cancel");
							return emb;
						},
						retry: message => `${us} Please enter a valid number.`,
						prompt: true
					}
				}

				if (action == 2){
					rename = yield{
						type: "string",
						prompt:{
							start: message => `${us} Enter the new name for ${cultist.name}.`,
							retry: message => `${us} Please enter a valid name.`,
							prompt: true
						}
					}
				}
				if (action == 5){
					confirmSell = yield{
						type: "yes/no",
						prompt:{
							start: message => `${us} Are you sure you want to sell ${cultist.name}? This cannot be undone.`,
							retry: message => `${us} Please enter \`yes\` or \`no\`.`,
							prompt: true
						}
					}
				}


				return {players, cultistNum, action, rename, confirmSell}
			} else {
				return message.channel.send(`${us} You do not own any cultists yet. Type /shop to buy some.`);
			}

		} catch(err){
			console.log('Error parsing JSON string:', err)
		}
	}
	async exec(message, args) {
		const us = message.author;
		const mem = message.member;
		const players = args.players;
		let pl;
		if (players){
			for (let ply of players){
				if (ply.name == message.author.toString()){
					pl = ply;
				}
			}
			const cultist = pl.cultists[args.cultistNum];


			if (args.rename){
				message.channel.send(`${us} Successfully changed the name of '${cultist.name}'' into '${args.rename}'.`)
				cultist.name = args.rename;
				let writeJsonString = JSON.stringify(players, null, 2);
				fs.writeFileSync('IdleGame/stats.json', writeJsonString);
				return 
			}
			if (args.confirmSell){
				if (args.confirmSell == 'yes'){
					message.channel.send(`${us} Successfully sold ${cultist.name} for £${cultist.value/2}`);
					pl.money += (cultist.value/2);
					pl.cultists.splice(args.cultistNum,1);
					let writeJsonString = JSON.stringify(players, null, 2);
					fs.writeFileSync('IdleGame/stats.json', writeJsonString);
					return
				} else{
					return message.channel.send(`${us} ${cultist.name} has not been sold.`)
				}
			}
		}			
		
	}
}

module.exports = IGCultistCommand;