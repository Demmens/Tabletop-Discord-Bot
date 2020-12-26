const { Command } = require("discord-akairo");
const Discord = require("discord.js");
const f = require('../../functions.js');
const w = require('../../IdleGame/weapons.js');
const a = require('../../IdleGame/armour.js');

class updatePlayersCommand extends Command {

	constructor() {
		super("updatePlayers", {
			aliases: ["updatePlayers"],
			args: []
		});
	}
	async exec(message, args) {
		const DB = this.client.db;
	
	}	
}

module.exports = updatePlayersCommand;