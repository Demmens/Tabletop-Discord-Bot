const { Command } = require("discord-akairo");
const Discord = require("discord.js");
const f = require('../../functions.js');

class updatePlayersCommand extends Command {

	constructor() {
		super("updatePlayers", {
			aliases: ["updatePlayers"],
			args: []
		});
	}
	async exec(message, args) {
		
	}
}

module.exports = updatePlayersCommand;