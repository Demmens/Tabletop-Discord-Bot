const { Listener } = require("discord-akairo");

class playerToDatabaseListener extends Listener {
	constructor() {
		super(
			"playerToDatabase",
			{
				emitter: "client",
				event: "guildMemberAdd"
			}
		);
	}

	exec(member) {
		const guild = member.guild;
		const user = member.user;
		const DB = this.client.db;

		try{
			DB.query(`
				INSERT INTO users (user_id)
				VALUES (${user.id})
				`)
			.then(console.log(`user ${member.displayName} was added to the users database`))
		}
		catch(err){} //Only error should be duplicate users, in which case we don't need an error message.
		try{
			DB.query(`
				INSERT INTO members (user_id, guild_id)
				VALUES (${user.id}, ${guild.id})
				`)
			.then(console.log(`user ${member.displayName} was added to the members database`))
		}
		catch(err){} //Only errors should be duplicate members (don't care), or guild not registered. Latter shouldn't be an issue.
	}
}

module.exports = playerToDatabaseListener;

//Thanks to Joe Gibson for the code