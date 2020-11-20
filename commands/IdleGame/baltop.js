const { Command } = require("discord-akairo");
const fs = require('fs');
const Discord = require("discord.js");
const f = require('../../functions.js');
const f2 = require('./functions.js')

class BaltopCommand extends Command {

	constructor() {
		super("Baltop", {
			aliases: ["Baltop", "Leaderboards"],
			args: [],
			description: "View the money leaderboards"
		});
	}
	async exec(message, args) {
		const players = f2.retrieveStats();
		let arr = [];
		for (let pl of players){
			let obj = {
				name: pl.cultname,
				money: pl.money
			}
			arr.push(obj);
		}
		console.log(arr)
		arr.sort(function(a,b){
			if (a.money > b.money) return -1
			else return 1
		})
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