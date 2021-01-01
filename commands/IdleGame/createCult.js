const { Command, Argument } = require("discord-akairo");
const Discord = require("discord.js");
const f = require('../../functions.js');

class CreateCultCommand extends Command {
	constructor() {
		super("CreateCult", {
			aliases: ["CreateCult", "NewCult", "StartCult"],
			cooldown: 5000,
			description: {
				name: 'Createcult',
				description: 'Creates your cult',
				options: [
					{
						name: 'Name',
						description: 'Max 50 characters.',
						type: 5,
						required: true
					}
				]
			}
		});
	}
	async *args(message){
		let us = `<@${message.author.id}>`;
		const ply = await f.getCult(message.author);
		if (ply) return `${us} You already have a cult.`

		const name = yield{
			type: Argument.validate('string', (m, p, str) => str.length <= 50),
			prompt: {
				start: message => `${us} What would you like to name your cult?`,
				retry: message => `${us} Please enter a valid name. Limit 50 characters`,
				prompt: true
			}
		}

		return {name};
	}
	async exec(message, args) {
		if (args.name){
			const us = message.author.toString();

			
			let firstCultist = f.CreateCultist();
			while (firstCultist.value > 60000) firstCultist = f.CreateCultist();
			let cultists = [];
			cultists.push(firstCultist);
			let query = `
			INSERT INTO cults(owner_id,name, cultists)
			VALUES (${message.author.id},'${args.name}', '${JSON.stringify(cultists)}')
			`

			await this.client.db.query(query);
			return message.channel.send(`${us} Your cult '${args.name}' has successfully been created`)
		}
	}
}

module.exports = CreateCultCommand;