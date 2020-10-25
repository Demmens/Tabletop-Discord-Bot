const { Command } = require("discord-akairo");

class AppeaseCommand extends Command {
	constructor() {
		super("Sacrifice", {
			aliases: ["Sacrifice"],
			args: [],
			description: "Appease the bot, lest it turn on the server."
		});
	}
	exec(message, args) {
		return message.channel.send('Your sacrifice has been noted.');
	}
}

module.exports = AppeaseCommand;