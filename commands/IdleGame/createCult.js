const { Command } = require("discord-akairo");
const Discord = require("discord.js");
const f = require('../../functions.js');

class CreateCultCommand extends Command {
	constructor() {
		super("CreateCult", {
			aliases: ["CreateCult", "NewCult", "StartCult"],
			description: "Create a cult to devote your life to the bot.",
			cooldown: 5000
		});
	}
	async *args(message){
		let us = message.author;
		const ply = await f.getCult(us);
		if (ply) return `${us} You already have a cult.`

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
			const us = message.author;

			const query = `
			INSERT INTO cults(owner_id,name)
			VALUES (${us.id},'${args.name}')
			`
			try{
				await this.client.db.query(query);
				return message.channel.send(`${us} Your cult '${args.name}' has successfully been created`)
			}
			catch(err){
				console.error(err);
				return message.channel.send(`${us} Something went wrong.`)
			}
			
		}
	}
}

module.exports = CreateCultCommand;