const { Command, Argument } = require("discord-akairo");
const fs = require('fs');
const Discord = require("discord.js");
const f = require('../../functions.js');
const f2 = require('./functions.js');

class IGShopCommand extends Command {
	constructor() {
		super("Shop", {
			aliases: ["Shop"],
			description: "Buy things"
		});
	}
	*args(message){
		let d = new Date();
		let curDate = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;

		const shopMenu = yield{ //First Shop UI
			type: Argument.range('integer',0,6),
			prompt:{
				start: message => {
					let embed = new Discord.MessageEmbed()
					.setTitle('Shop')
					.setDescription('1 - Upgrades\n2 - Cultists\n3 - Staff')

					return{embed};
				},
				retry: message => `${us} Please enter a valid number.`,
				prompt: true
			}
		}

		let cultistMenu; //|Create vars here so we can just return them all at the end and save lots of work.
		let cultistConfirm; //|
		let usStats;

		try {
			const jsonStringStats = fs.readFileSync('IdleGame/stats.json');
			const players = JSON.parse(jsonStringStats);
			const jsonStringStaff = fs.readFileSync('IdleGame/availableStaff.json');
			const curStaff = JSON.parse(jsonStringStaff);
			const us = message.author;
			const numCultists = 10; //Number of cultists in the shop

			for (let i of players){
				if (i.name == us.toString()){
					usStats = i;
				}
			}

			if (shopMenu == 2){
				if (curStaff.date != curDate){
					curStaff.cultists = [];
					curStaff.date = curDate;
					curStaff.cultists = []
					for (let i=0;i<5;i++){
						let cultist = f2.CreateCultist();
						let arr = {
							name: cultist.name,
							id: cultist.id,
							hp: cultist.hp,
							level: cultist.level,
							stats: {
								str: cultist.stats.str,
								dex: cultist.stats.dex,
								con: cultist.stats.con,
								int: cultist.stats.int,
								wis: cultist.stats.wis,
								cha: cultist.stats.cha
							},
							value: cultist.value,
						}
						curStaff.cultists.push(arr);
					}

					let writeJsonString = JSON.stringify(curStaff, null, 2);
					fs.writeFile('IdleGame/availableStaff.json', writeJsonString, err => {
						if (err) {
							console.log('Error writing file', err);
						}
					})
				} 
				
				let unOwned = [];
				for(let i of curStaff.cultists){
					let owned = [];
					let isOwned = false;
					for (let c of usStats.cultists){
						if (c.id == i.id){
							owned.push(i);
							isOwned = true;
						}
					}
					if (!isOwned){
						unOwned.push(i);
					}
				}
				unOwned.sort(function(a,b){
					if (a.value > b.value){
						return 1
					} else{
						return -1
					}
				})

				let desc = "";
				let x = 0;
				for (let i of unOwned){
					x++;
					desc +=`${x} - **${i.name}** - (£${f.numberWithCommas(i.value)})\n`
				}

				cultistMenu = yield {
					type: Argument.range('integer',0,unOwned.length, true),
					prompt:{
						start: message => {					
							
							let emb = new Discord.MessageEmbed()
							.setTitle('Cultists')
							.setDescription(desc);

							return emb;
						},
						retry: message => `${us} Please enter a valid number.`,
						prompt: true
					}
				}

				cultistMenu = unOwned[cultistMenu-1]
				let embed = new Discord.MessageEmbed()
				.setTitle(`Hire ${cultistMenu.name}?`)
				.setDescription(`${f2.createCultistStatString(cultistMenu)}\nCost: £${f.numberWithCommas(cultistMenu.value)}`);

				cultistConfirm = yield {
					type: "yes/no",
					prompt:{
						start: message => {
							return embed;
						},
						retry: message => `${us} Please enter 'yes' or 'no'.`,
						prompt: true
					}
					
				}				
			}

		} catch(err){
			console.log('Error parsing JSON string:', err)
		}

		return{shopMenu, cultistMenu, cultistConfirm}
	}
	async exec(message, args) {
		try {
			const jsonStringStats = fs.readFileSync('IdleGame/stats.json');
			const players = JSON.parse(jsonStringStats);
			const jsonStringStaff = fs.readFileSync('IdleGame/availableStaff.json');
			const curStaff = JSON.parse(jsonStringStaff);
			const us = message.author;
			let usStats;

			for (let i of players){
				if (i.name == us.toString()){
					usStats = i;
				}
			}

			if (args.cultistConfirm){
				if (args.cultistConfirm == 'yes'){
					let price = args.cultistMenu.value;
					if (price > usStats.money){
						return message.channel.send(`${us} You cannot afford that cultist.`)
					}

					usStats.cultists.push(args.cultistMenu);
					usStats.money -= price;

					let writeJsonString = JSON.stringify(players, null, 2);
					fs.writeFile('IdleGame/stats.json', writeJsonString, err => {
						if (err) {
							console.log('Error writing file', err);
						}
					})
					return message.channel.send(`${us} Successfully hired ${args.cultistMenu.name}`)
				}
			}
		} catch(err){
			console.log('Error parsing JSON string:', err)
		}
		
	}
}

module.exports = IGShopCommand;