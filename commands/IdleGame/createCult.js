const { Command } = require("discord-akairo");
const fs = require('fs');
const Discord = require("discord.js");
const f = require('../../functions.js');
const f2 = require('./functions.js');

class CreateCultCommand extends Command {
	constructor() {
		super("CreateCult", {
			aliases: ["CreateCult", "NewCult", "StartCult"],
			description: "Create a cult to devote your life to the bot.",
			cooldown: 5000
		});
	}
	*args(message){
		let jsonString = fs.readFileSync('IdleGame/stats.json');
		let players = JSON.parse(jsonString);
		let us = message.author;

		for (let ply of players){
			if (ply.name == us.toString()){
				return message.channel.send(`${us} You already have a cult.`)
			}
		}

		const name = yield{
			type: 'string',
			prompt: {
				start: message => `${us} What would you like to name your cult?`,
				retry: message => `${us} Please enter a valid name.`,
				prompt: true
			}
		}

		return {name};
	}
	async exec(message, args) {
		if (args.name){
			let jsonString = fs.readFileSync('IdleGame/stats.json');
			let players = JSON.parse(jsonString);
			let us = message.author;
			let newPly = f2.createPlayer(us, args.name);
			players.push(newPly);
			fs.writeFileSync('IdleGame/stats.json',JSON.stringify(players,null,2));

			return message.channel.send(`${us} Your cult '${args.name}' has successfully been created`)
		}
	}
}

module.exports = CreateCultCommand;