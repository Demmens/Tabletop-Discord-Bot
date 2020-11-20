const { Command } = require("discord-akairo");
const fs = require('fs');
const Discord = require("discord.js");
const f = require('../../functions.js');
const f2 = require('./functions.js');

class giveCultRoleCommand extends Command {

	constructor() {
		super("GiveRoles", {
			aliases: ["GiveRole"],
			args: [],
			description: "See how much money you have"
		});
	}
	async exec(message, args) {
		const players = f2.retrieveStats();
		for (let pl of players){
			for (let [_,mem] of message.guild.members.cache){
				console.log('mem name = ',mem.user.toString())
				console.log('cult name = ',pl.name)
				if (mem.user.toString() == pl.name){
					console.log(`1`)
					for (let [_,rl] of message.guild.roles.cache){
						if (rl.name == 'Cult Owner'){
							mem.roles.add(rl);
							console.log('2')
						}
					}
				}
			}
		}
	}
}

module.exports = giveCultRoleCommand;