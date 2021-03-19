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
			member.guild.systemChannel.send(`Welcome to the **${member.guild.name}** server, ${member}! Go to the ${member.guild.channels.cache.get('769131551828869130').toString()} channel to gain access to the various parts of the society!`);
		}
	}
}

module.exports = WelcomeListener;

//Thanks to Joe Gibson for the code