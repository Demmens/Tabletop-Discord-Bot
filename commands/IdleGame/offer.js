const { Command } = require("discord-akairo");
const fs = require('fs');
const Discord = require("discord.js");

class OfferCommand extends Command {
	constructor() {
		super("Offer", {
			aliases: ["Offer"],
			args: [],
			description: "Appease the bot, lest it turn on the server."
		});
	}
	async exec(message, args) {

		try {
			const jsonString = fs.readFileSync('IdleGame/stats.json');
			const players = JSON.parse(jsonString);
			let auth = message.author;

			const daily = 50; //Percentage of sacrifice money gained for the daily reward
			const sacGainMin = 20; //Min money gained for sacrifice
			const sacGainMax = 150; //Max money gained for sacrifice

			function manualMoneyGain() {		
				let sacGainDifference = sacGainMax - sacGainMin;
				return Math.floor(Math.random()*sacGainDifference) + sacGainMin;
			}

			let d = new Date();
			let curDate = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;

			for (let ply of players){
				if (ply.name == auth.toString()){
					if (ply.sacrifices ==0 ){
						return message.channel.send(`${auth} You have nothing to offer me, human.`);
					} else {
						let total = 0;
						for (let i=0;i< ply.sacrifices;i++){
							let money = manualMoneyGain();
							total += money;
						}
						total *= ply.offerMultiplier;

						message.channel.send(`${auth} Your offering of ${ply.sacrifices} sacrifices has been rewarded.`);
						message.channel.send(`${auth} You gain £${total}.`);

						ply.money += total;
						ply.sacrifices = 0;

						if (ply.lastUsed != curDate){
							ply.lastUsed = curDate;
							message.channel.send(`${auth} +${daily}% (£${Math.ceil(total*daily/100)}) for first offering of the day.`);
							ply.money += Math.ceil(total*daily/100);
						}
					}
				}
			}


			let writeJsonString = JSON.stringify(players, null, 2);
			fs.writeFile('IdleGame/stats.json', writeJsonString, err => {
				if (err) {
					console.log('Error writing file', err);
				}
			})


		} catch(err){
			console.log('Error parsing JSON string:', err)
		}
	}
}

module.exports = OfferCommand;