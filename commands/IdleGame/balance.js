const { Command } = require("discord-akairo");
const fs = require('fs');
const Discord = require("discord.js");
const f = require('../../functions.js');

function CreateBalanceEmbed(message, ply){
	let player;
	for (let [_,mem] of message.guild.members.cache){
		if (mem.user.toString() == ply.name){
			player = mem;
		}
	}
	let emb = new Discord.MessageEmbed()
	.setTitle(`${player.displayName}'s Balance`)
	.setDescription(`Money: £${f.numberWithCommas(ply.money)}\nSacrifices: ${f.numberWithCommas(ply.sacrifices)}/${f.numberWithCommas(ply.sacrificeMax)}`)

	return emb;
}

class IGBalanceCommand extends Command {

	constructor() {
		super("Balance", {
			aliases: ["Balance", "Bal"],
			args: [
				{
					id: "player",
					type: "memberMention"
				}
			],
			description: "See how much money you have"
		});
	}
	async exec(message, args) {


		try {
			const jsonString = fs.readFileSync('IdleGame/stats.json');
			const players = JSON.parse(jsonString);


			for (let ply of players){
				if (args.player && ply.name == args.player.user.toString()){
					return message.channel.send(CreateBalanceEmbed(message, ply));
				} else if (!args.player && ply.name == message.author.toString()){
					return message.channel.send(CreateBalanceEmbed(message, ply));
				}
			}

			if (args.player.user.bot){
				return message.channel.send(`Bots do not trifle with human concepts such as money.`)
			}
			return message.channel.send(`${args.player.displayName} has not made a sacrifice yet.`)


		} catch(err){
			console.log('Error parsing JSON string:', err)
		}
	}
}

module.exports = IGBalanceCommand;