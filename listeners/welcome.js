const { Listener } = require("discord-akairo");

class WelcomeListener extends Listener {
	constructor() {
		super(
			"welcome",
			{
				emitter: "client",
				event: "guildMemberAdd"
			}
		);
	}

	exec(member) {
		if (!this.client.testMode) {
			member.guild.systemChannel.send(`Welcome to the **${member.guild.name}** server, ${member}`);
		}
	}
}

module.exports = WelcomeListener;