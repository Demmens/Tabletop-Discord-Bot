const { Command } = require("discord-akairo");
const fs = require('fs');
const Discord = require("discord.js");
const f = require('../../functions.js');
const f2 = require('./functions.js');

const sacTime = 10000

class SacrificeCommand extends Command {
	constructor() {
		super("Sacrifice", {
			aliases: ["Sacrifice", "s"],
			args: [],
			description: "Appease the bot, lest it turn on the server.",
			cooldown: sacTime
		});
	}
	async exec(message, args) {

		let players = f2.retrieveStats();
		let auth = message.author;

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
				let addS = '';
				if (newIncrease > 1) addS = 's';
				let bc = '<:black_circle:779325534340907047>';
				let blood = '<:drop_of_blood:779325626330775600>';
				let goat = '<:goat:779324716468666398>';
				let skull = '<:skull:779325626330775600>';

				const sacSpeed = ply.sacSpeed*sacTime;
				const barLength = 4;
				const finalDur = 0;
				let ogBar = '';

				for (let i=0; i<barLength;i++){
					ogBar += bc;
				}
				ogBar += goat;

				let msg = await message.channel.send(`${auth} Creating sacrifice${addS}.. `+ogBar);

				setTimeout(function() {
					players = f2.retrieveStats();//Stuff can change in 5 seconds, so make sure to re-obtain the player info.
					for (let pl of players) if (pl.name == ply.name) ply = pl; //
					ply.sacrifices += newIncrease;
					if (newIncrease == 1){
						msg.edit(`${auth} Sacrifice complete. You have ${f.numberWithCommas(ply.sacrifices)}/${f.numberWithCommas(ply.sacrificeMax)} total sacrifices.`)
					} else{msg.edit(`${auth} Sacrifices complete. You have ${f.numberWithCommas(ply.sacrifices)}/${f.numberWithCommas(ply.sacrificeMax)} total sacrifices.`);}
					f2.writeStats(players);
				}, sacSpeed);	

				for (let i=1;i<barLength+1;i++){
					setTimeout(function(){
						let newMsg = '';
						for (let j=0;j<i;j++){
							newMsg += blood;
						}
						for (let j=0;j<barLength-i;j++){
							newMsg += bc;
						}
						if (i == barLength)newMsg += skull;
						else newMsg += goat;
						msg.edit(`${auth} Creating sacrifice${addS}.. `+newMsg);
					},((i*sacSpeed)/(barLength+1))-finalDur);
				}		
				return;
			}
		}
		return message.channel.send(`${auth} You must have a cult to perform sacrifices. Create one with /CreateCult`)
	}
}

module.exports = SacrificeCommand;