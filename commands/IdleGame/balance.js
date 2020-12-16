const { Command } = require("discord-akairo");
const Discord = require("discord.js");
const f = require('../../functions.js');

async function CreateBalanceEmbed(message, player){
	ply = await f.getCult(player);
	if (!ply) return null;
	let emb = new Discord.MessageEmbed()
	.setTitle(`${player.displayName}'s Balance`)
	.setDescription(`Money: £${f.numberWithCommas(ply.money)}\nSacrifices: ${f.numberWithCommas(ply.sacrifices)}/${f.numberWithCommas(ply.sacrificemax)}\nResearch: ${f.numberWithCommas(ply.research)}`)

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
		const us = message.author;
		let ply = message.member;
		if (args.player) ply = args.player;
		let emb = await CreateBalanceEmbed(message, ply);

		if (ply.user.bot){
			return message.channel.send(`${us} Bots do not trifle with human concepts such as money.`)
		}
		if (emb) return message.channel.send(emb);
		else if (ply == message.member) return message.channel.send(`${us} You have not set up a cult yet. Type /CreateCult to get started.`);
		else return message.channel.send(`${us} That player does not own a cult.`)

	}
}

module.exports = IGBalanceCommand;