const { Command } = require("discord-akairo");
const Discord = require("discord.js");
const f = require('../../functions.js');

class sellWeaponsCommand extends Command {

	constructor() {
		super("sellWeapons", {
			aliases: ["sellWeapons"],
			description: 'Sell your lowest value weapons.'
		});
	}
	async *args(message){
		const us = message.author;

		const num = yield{
			type: 'integer',
			prompt:{
				start: message => `${us} How many weapons do you wish to keep?`,
				retry: message => `${us} Please enter a valid number.`
			}
		};

		const confirm = yield{
			type: ['yes','no'],
			prompt: {
				start: message => `${us} Are you sure you want to keep your best ${num} weapons and sell the rest?`,
				retry: message => `${us} Please enter 'yes' or 'no'.`
			}
		}
	}
	async exec(message, args) {
		const DB = this.client.db;
		const us = message.author;
		const pl = await f.getCult(us);
		
	}
}

module.exports = sellWeaponsCommand;