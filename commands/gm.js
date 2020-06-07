const { Command } = require("discord-akairo");

class GmCommand extends Command {
	constructor() {
		super("gm", {
			aliases: ["gm", "createrpg"],
			args: [{id: "message", type: "string", default: "Please specify the name of your game", match: "content"}],
			description: "Creates channels for your roleplay game"
		});
	}
	exec(message, args) {
		message.guild.roles.create({
			data: {
				name: args.message,
				color: 'GOLD'
			}
		})
			.then(console.log)
			.catch(console.error);

		return message.channel.send('Created your game: \''.concat(args.message,'\''));
	}
}

module.exports = GmCommand;