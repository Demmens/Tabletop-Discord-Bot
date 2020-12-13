const { Command } = require("discord-akairo");
const Discord = require("discord.js");
const f = require('../../functions.js');
const talkedRecently = new Set();

const sacTimeMin = 1000 //Min time for a sacrifice is 1 second.
const sacTime = 7000 //Base of 7 seconds to create a sacrifice.

class SacrificeCommand extends Command {
	constructor() {
		super("Sacrifice", {
			aliases: ["Sacrifice", "s"],
			args: [],
			description: "Appease the bot, lest it turn on the server.",
			cooldown: sacTimeMin
		});
	}
	async exec(message, args) {
		const us = message.author;
		if (talkedRecently.has(us.id)){
			return message.delete();
		}

		const DB = this.client.db
		let ply = await f.getCult(us);
		if (!ply) return message.channel.send(`${us} You must create a cult before you can make sacrifices. Type /CreateCult to get started.`)
		ply.sacrifices = Number(ply.sacrifices);
		ply.sacrificemax = Number(ply.sacrificemax);
		ply.sacrificespeedadd = Number(ply.sacrificespeedadd);
		ply.sacrificespeedmult = Number(ply.sacrificespeedmult);

		if (ply.sacrifices >= ply.sacrificemax){
			return message.channel.send(`${us} You do not have any more space to store sacrifices. /offer to offer them to the bot or increase your storage in the /shop.`)
		}
		talkedRecently.add(us.id);
		
		let newTot = ply.sacrifices + Math.ceil((ply.sacrificemultiplier+ (ply.percentsac * ply.sacrifices / 100))*ply.sacmult);			
		console.log(`ply.percentsac = ${ply.percentsac}`);
		console.log(`increase sacrifices = ${Math.ceil(ply.percentsac*ply.sacrificemax / 1000)}`)
		if (newTot >= ply.sacrificemax){
			newTot = ply.sacrificemax;
		}
		let newIncrease = newTot - ply.sacrifices;	
		let addS = '';
		if (newIncrease > 1) addS = 's';
		const bc = '<:black_circle:779325534340907047>';
		const blood = '<:drop_of_blood:779325626330775600>';
		const goat = '<:goat:779324716468666398>';
		const skull = '<:skull_crossbones:784352196321869866>';

		const sacSpeed = ply.sacrificespeedmult*(sacTime+(ply.sacrificespeedadd*1000));
		const barLength = 4;
		const finalDur = 0;
		let ogBar = '';

		for (let i=0; i<barLength;i++){
			ogBar += bc;
		}
		ogBar += goat;

		let msg = await message.channel.send(`${us} Creating ${newIncrease} sacrifice${addS}.. `+ogBar);

		setTimeout(async function() {
			ply = await f.getCult(us);//Stuff can change in this amount of time, so make sure to re-obtain the player info.
			ply.sacrifices = Number(ply.sacrifices);
			ply.sacrificemax = Number(ply.sacrificemax);
			ply.sacrifices += newIncrease;
			if (ply.sacrifices > ply.sacrificemax) ply.sacrifices = ply.sacrificemax;
			if (newIncrease == 1){
				msg.edit(`${us} Sacrifice complete. You have ${f.numberWithCommas(ply.sacrifices)}/${f.numberWithCommas(ply.sacrificemax)} total sacrifices.`)
			} else{msg.edit(`${us} Sacrifices complete. You have ${f.numberWithCommas(ply.sacrifices)}/${f.numberWithCommas(ply.sacrificemax)} total sacrifices.`);}
			f.writeCults(us.id,'sacrifices',BigInt(ply.sacrifices));
			talkedRecently.delete(us.id);
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
				msg.edit(`${us} Creating ${newIncrease} sacrifice${addS}.. `+newMsg);
			},((i*sacSpeed)/(barLength+1))-finalDur);
		}		
		return;
	}
}

module.exports = SacrificeCommand;