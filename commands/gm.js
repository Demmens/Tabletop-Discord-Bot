const { Command } = require("discord-akairo");

class GmCommand extends Command {
	constructor() {
		super("gm", {
			aliases: ["gm"],
			args: [
				{id: "command", type: "string", default: "help", match: "content"},
				{id: "name", type: "string", default: 'asdf', match: "content"}
			],
			description: "Manages channels for your roleplay game"
		});
	}
	exec(message, args) {
		if (args.command == 'create') {
			if (args.name == 'asdf'){
				return message.channel.send('Please specify the name of your game');
			} else{
				message.guild.roles.create({
					data: {
						name: args.name,
						color: 'GOLD'
					}
				})
					.then(console.log)
					.catch(console.error);

				return message.channel.send('Created your game: \''.concat(args.name,'\''));
			}
		}
	}
}

module.exports = GmCommand;