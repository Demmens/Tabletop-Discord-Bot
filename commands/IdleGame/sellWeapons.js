const { Command, Argument } = require("discord-akairo");
const Discord = require("discord.js");
const f = require('../../functions.js');

class sellWeaponsCommand extends Command {

	constructor() {
		super("sellWeapons", {
			aliases: ["sellWeapons"],
			description: {
				name: 'Sellweapons',
				description: 'Bulk sell your weapons.',
				options: [
					{
						name: 'Keep',
						description: 'How many weapons to keep',
						type: 4,
						required: true
					}
				]
			}
		});
	}
	async *args(message){
		const us = `<@${message.author.id}>`;
		const DB = this.client.db;
		var pl = await f.getCult(message.author);
		pl.items = JSON.parse(pl.items);
		if (pl.items.weapons.length == 0) return message.channel.send(`${us} You do not own any weapons.`)

		const num = yield{ //Number of items to keep
			type: Argument.range('integer',-1,pl.items.weapons.length),
			prompt:{
				start: message => `${us} How many weapons do you wish to keep?`,
				retry: message => `${us} Please enter a valid number.`
			}
		};

		let sellArr = [];
		let sellValue = 0;
		pl.items.weapons.sort(function(a,b){return b.value-a.value});
		for (let i = 0; i < pl.items.weapons.length;i++){
			let itm = pl.items.weapons[i];
			if (i >= num){
				sellArr.push(itm);
				sellValue += Math.floor(itm.value/2);
			}
		}

		let confirm;
		let page = 0;
		let pagesize = 8;
		while (confirm != 'yes' && confirm != 'no'){
			let prev = '';
			let next = '';
			let pageMax = Math.ceil(sellArr.length/pagesize);
			if (page != 0) prev = '0 - Previous Page.';
			if (page+1 < pageMax) next = '9 - Next Page.';
			let displayStr = '';
			for (let i = page*pagesize; i < Math.min((page+1)*pagesize,sellArr.length); i++){
				displayStr += `${sellArr[i].name}\n`
			}

			confirm = yield{
				type: [['yes', 'y'], ['no', 'n'], '0', '9'],
				prompt: {
					start: message => {
						let emb = new Discord.MessageEmbed()
						.setTitle(`Do you wish to sell these items for £${f.numberWithCommas(sellValue)}?`)
						.setDescription(displayStr)
						.setFooter(`${prev} ${next} (${page+1}/${pageMax})`)
						return emb;
					},
					retry: message => `${us} Please enter 'yes' or 'no'.`,
					prompt: true
				}
			}

			if (confirm == 9 && page < pageMax) page++;
			if (confirm == 0 && page != 0) page--;
		}
		if (confirm == 'yes'){
			pl = await f.getCult(message.author);
			pl.items = JSON.parse(pl.items);
			let x = 0;
			for (let itm of pl.items.weapons){
				for (let itm2 of sellArr) if (itm2.id == itm.id) pl.items.weapons.splice(x,1);
				x++;
			}
			pl.money = Number(pl.money)
			pl.money += sellValue;

			DB.query(`
				UPDATE cults
				SET money = ${pl.money},
				items = '${JSON.stringify(pl.items)}'
				WHERE owner_id = ${pl.owner_id}
				`)
			return message.channel.send(`${us} Sold ${sellArr.length} weapons for £${f.numberWithCommas(sellValue)}. Balance: £${f.numberWithCommas(pl.money)}.`)

		} else return message.channel.send(`${us} Weapons not sold.`)
	}
	async exec(){}
}

module.exports = sellWeaponsCommand;