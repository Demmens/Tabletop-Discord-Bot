const { Command } = require("discord-akairo");
const Discord = require("discord.js");
const f = require('../../functions.js');

async function CreateBalanceEmbed(message, player){
	ply = (await f.runQuery(`select * from cults where owner_id = ${player}`)).rows[0];
	if (!ply) return null;
	let emb = new Discord.MessageEmbed()
	.setTitle(`${ply.name}'s Balance`)
	.setDescription(`Money: £${f.numberWithCommas(ply.money)}\nSacrifices: ${f.numberWithCommas(ply.sacrifices)}/${f.numberWithCommas(ply.sacrificemax)}\nResearch: ${f.numberWithCommas(ply.research)}`)

	return emb;
}

class IGBalanceCommand extends Command {

	constructor() {
		super("Balance", {
			aliases: ["Balance"],
			args: [
				{
					id: "player",
				}
			],
			description: {
				name: 'Balance',
				description: 'Check your total money, sacrifices and research',
				options: [
					{
						type: 6,
						name: 'User',
						description: 'View another persons balance',
						required: true
					}
				]
			}
		});
	}
	async exec(message, args) {
		const us = `<@${message.author.id}>`;
		if (!args.player) return
		let emb = await CreateBalanceEmbed(message, args.player);

		if (emb) return message.channel.send(emb);
		else if (args.player == message.member.id) return message.channel.send(`${us} You have not set up a cult yet. Type /CreateCult to get started.`);
		else return message.channel.send(`${us} That player does not own a cult.`)

	}
}

module.exports = IGBalanceCommand;