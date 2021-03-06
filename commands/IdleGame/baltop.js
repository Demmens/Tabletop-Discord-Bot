const { Command } = require("discord-akairo");
const Discord = require("discord.js");
const f = require('../../functions.js');

class BaltopCommand extends Command {

	constructor() {
		super("Baltop", {
			aliases: ["Baltop", "Leaderboards"],
			args: [],
			description: {
				name: 'Baltop',
				description: 'View the top 10 players'
			}
		});
	}
	async exec(message, args) {
		const DB = this.client.db;
		const players = (await DB.query(`SELECT * FROM cults`)).rows;
		let arr = [];
		for (let pl of players){
			let obj = {
				name: pl.name,
				money: pl.money
			}
			arr.push(obj);
		}
		arr.sort(function(a,b){return b.money-a.money})
		let balStr = '';
		for (let i=0;i<10;i++){
			if (arr[i])	balStr += `${i+1} - ${arr[i].name} - £${f.numberWithCommas(arr[i].money)}\n`;
		}

		let emb = new Discord.MessageEmbed()
		.setTitle('Money Leaderboards')
		.setDescription(balStr);

		return message.channel.send(emb);
	}
}

module.exports = BaltopCommand;