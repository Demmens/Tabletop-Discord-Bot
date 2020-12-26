const { Command } = require("discord-akairo");
const Discord = require("discord.js");
const f = require('../../functions.js');

class OfferCommand extends Command {
	constructor() {
		super("Offer", {
			aliases: ["Offer"],
			args: [],
			description: "Appease the bot, lest it turn on the server."
		});
	}
	async exec(message, args) {
		const us = `<@${message.author.id}>`;
		const ply = await f.getCult(message.author);
		const DB = this.client.db;
		if (!ply) return
		ply.money = Number(ply.money);
		let daily = 50; //Percentage of sacrifice money gained for the daily reward
		const sacGainMin = 130; //Min money gained for sacrifice
		const sacGainMax = 250; //Max money gained for sacrifice

		function generateMoney() {		
			let sacGainDifference = sacGainMax - sacGainMin;
			return Math.floor(Math.random()*sacGainDifference) + sacGainMin;
		}

		let d = new Date();
		let curDate = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
		if (ply.sacrifices == 0 ){
			return message.channel.send(`${us} You have nothing to offer me, human.`);
		} else {
			let total = 0;
			for (let i=0;i< ply.sacrifices;i++){
				let money = generateMoney();
				total += money;
			}
			total *= ply.offermultiplier;

			message.channel.send(`${us} Your offering of ${f.numberWithCommas(ply.sacrifices)} sacrifices has been rewarded. You gain £${f.numberWithCommas(Math.ceil(total))} (Total: £${f.numberWithCommas(ply.money + Math.ceil(total))}).`);

			ply.money += Math.ceil(total);

			if (ply.lastused != curDate){
				daily *= ply.dailymultiplier;
				ply.lastused = curDate;
				message.channel.send(`${us} +${daily}% (£${f.numberWithCommas(Math.ceil(total*daily/100))}) for first offering of the day.`);
				ply.money += Math.ceil(total*daily/100);
			}
			let query = `
			UPDATE cults
			SET money = ${ply.money},
			sacrifices = 0,
			lastused = '${curDate}'
			WHERE owner_id = ${ply.owner_id}
			`
			DB.query(query);
		}
	}
}

module.exports = OfferCommand;