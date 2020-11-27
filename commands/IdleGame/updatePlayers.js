const { Command } = require("discord-akairo");
const fs = require('fs');
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
		const players = f.retrieveStats();
		for (let pl of players){
			pl.sacSpeedAdd = 0;
			pl.sacMult = 1;
		}
		f.writeStats(players);
	}
}

module.exports = updatePlayersCommand;