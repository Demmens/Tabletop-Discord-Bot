const { Command } = require("discord-akairo");
const Discord = require("discord.js");
const f = require('../../functions.js');
const conditions = require('../../IdleGame/conditions.js')

class updatePlayersCommand extends Command {

	constructor() {
		super("updatePlayers", {
			aliases: ["updatePlayers"],
			args: []
		});
	}
	async exec(message, args) {
		const DB = this.client.db;
		let cults = (await DB.query(`SELECT * FROM cults`)).rows;

		for (let cult of cults){
			let cultname = cult.name.split('');
			cult.name = '';
			for (let i = 0; i<50;i++){
				if (cultname.length > i){
					cult.name += cultname[i];
				}
			}
			console.log(cult.name);
			DB.query(`UPDATE cults SET name = '${cult.name}' WHERE owner_id = ${cult.owner_id}`)
		}
	}
}

module.exports = updatePlayersCommand;