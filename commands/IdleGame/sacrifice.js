const { Command } = require("discord-akairo");
const fs = require('fs');
const Discord = require("discord.js");

class SacrificeCommand extends Command {
	constructor() {
		super("Sacrifice", {
			aliases: ["Sacrifice", "s"],
			args: [],
			description: "Appease the bot, lest it turn on the server.",
		});
	}
	async exec(message, args) {

		try {
			const jsonString = fs.readFileSync('IdleGame/stats.json');
			const players = JSON.parse(jsonString);
			let auth = message.author;

			const daily = 200; //Amount gained for the daily reward
			const sacGainMin = 20; //Min amount gained for sacrifice
			const sacGainMax = 150; //Max amount gained for sacrifice

			function manualMoneyGain() {		
				let sacGainDifference = sacGainMax - sacGainMin;
				return Math.floor(Math.random()*sacGainDifference) + sacGainMin;
			}

			let isNew = 1;

			for (let ply of players){
				if (ply.name == auth.toString()){
					isNew = 0;
				}
			}

			let d = new Date();
			let curDate = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;



			if (isNew){
				let newPly = {
					name: auth.toString(),
					money: 0,
					sacrifices: 0,
					offerMultiplier: 1,
					sacrificeMultiplier: 1,
					sacrificeMax: 10,
					startDate: curDate,
					lastUsed: 0,
					upgrades: {
						renewable: [],
						oneTime: [],
					},
					cultists: []
				};

				players.push(newPly);

			}

			for (let ply of players){
				if (ply.name == auth.toString()){
					if (ply.sacrifices >= ply.sacrificeMax){
						return message.channel.send(`${auth} You do not have any more space to store sacrifices. /offer to offer them to the bot or increase your storage in the /shop.`)
					}
					let newTot = ply.sacrifices + ply.sacrificeMultiplier;					
					if (newTot >= ply.sacrificeMax){
						newTot = ply.sacrificeMax;
					}
					let newIncrease = newTot - ply.sacrifices;

					ply.sacrifices += newIncrease;
					if (newIncrease == 1){
						message.channel.send(`${auth} You have made a sacrifice. You have ${ply.sacrifices} total sacrifices.`)
					} else{message.channel.send(`${auth} You have made ${newIncrease} sacrifices. You have ${ply.sacrifices} total sacrifices.`);}
					
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

module.exports = SacrificeCommand;