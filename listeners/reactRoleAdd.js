  
const { Listener } = require("discord-akairo");
const config = require("../config.js");

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
		let message = messageReaction.message;
		if (message.author.id == this.client.user.id) {
			if (message.channel.id == 704330819392766035) { 
				if (message.content.startsWith("**ROLES**")) { //Roles
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
				else if(message.content.startsWith("**PRONOUNS**")){ //Pronouns
					let member = await message.guild.members.fetch(user.id);
					let found_role = false;
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
							member.roles.add(role);
							found_role = true;
						}
					}
					if (!found_role){
						messageReaction.remove(user);
					}
				}
			}
			else if (message.channel.id == 704331861534441532){
				if (message.content.startsWith("**First time players")){ //First time players
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