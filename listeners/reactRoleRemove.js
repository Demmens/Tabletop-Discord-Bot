const { Listener } = require("discord-akairo");

class ReactRoleRemoveListener extends Listener {
	constructor() {
		super(
			"reactRoleRemove",
			{
				emitter: "client",
				event: "messageReactionRemove"
			}
		);
	}

	async exec(messageReaction, user) {
		let message = messageReaction.message;
		let bot_id = this.client.user.id;
		if (message.author.id == this.client.user.id) {
			if (message.channel.name == "welcome") {
				if (message.content.startsWith("**ROLES**")) {
					let member = await message.guild.members.fetch(user.id);
					for (let role of message.guild.roles.cache) {
						if ((role[1].name.split(" ").join("")).toUpperCase() == messageReaction.emoji.name.toUpperCase()){
							member.roles.remove(role[1]);
						}
					}
				}
			}
		}
	}
}

module.exports = ReactRoleRemoveListener;