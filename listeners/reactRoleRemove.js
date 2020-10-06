const { Listener } = require("discord-akairo");
const config = require("../config.js");

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
			if (message.channel.id == 704330819392766035) {
				if (message.content.startsWith("**ROLES**")) {
					let member = await message.guild.members.fetch(user.id);
					for (let role of message.guild.roles.cache) {
						if ((role[1].name.split(" ").join("")).toUpperCase() == messageReaction.emoji.name.toUpperCase()){
							member.roles.remove(role[1]);
						}
					}
				} else if(message.content.startsWith("**PRONOUNS**")){ //Pronouns
					let member = await message.guild.members.fetch(user.id);
					let rlName = "";
					if (messageReaction.emoji.name == config.emoji_letters[7]){
						rlName = "He/Him";
					} else if (messageReaction.emoji.name == config.emoji_letters[18]){
						rlName = "She/Her";
					} else if (messageReaction.emoji.name == config.emoji_letters[19]){
						rlName = "They/Them";
					}
					for (let [_, role] of message.guild.roles.cache){
						if ((role.name == rlName)){
							member.roles.remove(role);
						}
					}
				}
			}
			else if (message.channel.id == 704331861534441532){
				if (message.content.startsWith("**First time players")){
					let member = await message.guild.members.fetch(user.id);
					for (let [_,role] of message.guild.roles.cache){

						if (role.name == "Newcomer" && messageReaction.emoji.name == "YesVote"){
							member.roles.remove(role);
						}
					}
				}
			}
		}
	}
}

module.exports = ReactRoleRemoveListener;