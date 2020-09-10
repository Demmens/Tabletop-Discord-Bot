  
const { Listener } = require("discord-akairo");

class ReactRoleAddListener extends Listener {
	constructor() {
		super(
			"reactRoleAdd",
			{
				emitter: "client",
				event: "messageReactionAdd"
			}
		);
	}

	async exec(messageReaction, user) {
		console.log('0')
		let message = messageReaction.message;
		if (message.author.id == this.client.user.id) {
			console.log('1')
			if (message.channel.name == "welcome") {
				console.log('2.0')
				if (message.content.startsWith("**ROLES**")) {
					let member = await message.guild.members.fetch(user.id);
					let found_role = false;
					for (let role of message.guild.roles.cache) {
						if ((role[1].name.split(" ").join("")).toUpperCase() == messageReaction.emoji.name.toUpperCase()){
							member.roles.add(role[1]);
							found_role = true
						}
					}
					if (!found_role) {
						messageReaction.remove(user);
					}
				} 
			}
			else if (message.channel.id == 704331861534441532){
				console.log('2.1')
				if (message.content.startsWith("**First time players**")){
					let member = await message.guild.members.fetch(user.id);
					let found_role = false;
					for (let [_,role] of message.guild.roles.cache){

						if (role.name == "Newcomer" && messageReaction.emoji.name == "YesVote"){
							member.roles.add(role);
							found_role = true;
						}
					}
					if (!found_role) {
						messageReaction.remove(user);
					}
				}
			}
		}
	}
}

module.exports = ReactRoleAddListener;