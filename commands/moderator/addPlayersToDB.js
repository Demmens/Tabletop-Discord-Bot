const { Command } = require("discord-akairo");

class addPlayersToDBCommand extends Command {
	constructor() {
		super("addInfoToDB", {
			aliases: ["addInfoToDB"],
			args: []
		});
	}
	async exec(message, args) {
		const DB = this.client.db;
		if (message.author.id != 144543622015090690) return
		try{
			if (!((await DB.query(`SELECT * FROM guilds WHERE guild_id = ${message.guild.id}`)).rows[0])){
				DB.query(`
					INSERT INTO guilds(guild_id)
					VALUES (${message.guild.id})
					`)
				console.log('Added guild to database')
			}
		}
		catch(err){}
		message.guild.members.fetch({force:true}); //cache all members
		for (let [_,mem] of message.guild.members.cache){
			let us = mem.user;
			console.log(`testing ${us.username}`)
			if (!((await DB.query(`SELECT * FROM users WHERE user_id = ${us.id}`)).rows[0])){
				await DB.query(`
					INSERT INTO users(user_id)
					VALUES (${us.id})
					`)
				console.log(`Added user ${us.username} to users database`)
			}
			let query = `
			SELECT * 
			FROM members 
			WHERE user_id = ${us.id} 
			AND guild_id = ${message.guild.id}`
			if (!((await DB.query(query)).rows[0])){
				await DB.query(`
					INSERT INTO members(user_id, guild_id)
					VALUES(${us.id},${message.guild.id})
					`)
				console.log(`Added user ${us.username} to members database`)
			}
		}
		return message.channel.send(`${message.author} Finished adding info to database`)
	}
}

module.exports = addPlayersToDBCommand;