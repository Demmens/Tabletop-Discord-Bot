const { Command, Argument } = require("discord-akairo");
const fs = require('fs');
const Discord = require("discord.js");
const f = require('../../functions.js');
const f2 = require('./functions.js');
const upgrades = require(`../../IdleGame/upgrades.js`);
const weapons = require(`../../IdleGame/weapons.js`);
const armour = require(`../../IdleGame/armour.js`);

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
					.setDescription('1 - Upgrades\n2 - Cultists\n3 - Items')
					.setFooter('Type \'cancel\' to cancel')

					return{embed};
				},
				retry: message => `${message.author} Please enter a valid number.`,
				prompt: true
			}
		}

		let cultistMenu; //|Create vars here so we can just return them all at the end and save lots of work.
		let cultistConfirm; //|
		let usStats;
		let upgradeConfirm;
		let upgr;
		let itemMenu;
		let weapon;
		let weaponConfirm;
		let arm;
		let armourConfirm;

		try {
			const jsonStringStats = fs.readFileSync('IdleGame/stats.json');
			const players = JSON.parse(jsonStringStats);
			const jsonStringStaff = fs.readFileSync('IdleGame/availableCultists.json');
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
						curStaff.cultists.push(cultist);
					}

					let writeJsonString = JSON.stringify(curStaff, null, 2);
					fs.writeFile('IdleGame/availableCultists.json', writeJsonString, err => {
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
							.setTitle(`Cultists (${usStats.cultists.length}/${usStats.maxCultists} owned)`)
							.setDescription(desc)
							.setFooter(`Balance: £${f.numberWithCommas(usStats.money)}`)

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
			} else if(shopMenu == 1){
				let avUpgr = [];
				
				for (let i of upgrades.oneTime){ //Run through all one time purchase upgrades
					let hasUpgr = false;
					let reqTbl = i.requirements;
					let hasReq = false;
					for (let j of usStats.upgrades.oneTime){ //Run through all one time upgrades the player owns
						if (i.id == j){ //Check for matches.
							hasUpgr = true
						}
					}
					if (!hasUpgr && i.requirements(message.member)){ //If they don't have it, and they have the requirements, then make it an available upgrade.
						avUpgr.push(i)
					}
				}

				for (let i of upgrades.repeatable){
					let temp = {...i}; //Create this so we don't constantly increase the price each time we look at the shop.
					for (let j of usStats.upgrades.repeatable){
						if (temp.id == j.id){
							temp.cost = Math.floor(i.cost*Math.pow(1.5,j.number)/250)*250;
						}
					}

					if (i.requirements(message.member)){
						avUpgr.push(temp);
					}
				}

				let upgrStr = "";
				let x = 0;
				for (let i of avUpgr){
					x++;
					upgrStr += `${x} - ${i.name} (${i.description}) - £${f.numberWithCommas(i.cost)}\n`;
				}

				const upgradeMenu = yield{
					type: Argument.range('integer',0,avUpgr.length, true),
					prompt:{
						start: message => {
							let emb = new Discord.MessageEmbed()
							.setTitle('Upgrades')
							.setDescription(upgrStr)
							.setFooter(`Balance: £${f.numberWithCommas(usStats.money)}`)
							return emb
						},
						retry: message => `${us} Please enter a valid number.`,
						prompt:true
					}
				}
				upgr = avUpgr[upgradeMenu-1];

				upgradeConfirm = yield{
					type: 'yes/no',
					prompt:{
						start: message => `${us} Are you sure you want to buy ${upgr.name} for £${f.numberWithCommas(upgr.cost)}?`,
						retry: message => `${us} Please enter \`yes\` or \`no\`.`,
						prompt: true
					}
				}
			} else if (shopMenu == 3){
				itemMenu = yield{
					type: Argument.range('integer',0,4),
					prompt: {
						start: message => {
							let emb = new Discord.MessageEmbed()
							.setTitle('Items')
							.setDescription('1 - Weapons\n2 - Armour\n3 - Misc')
							.setFooter(`Balance: £${f.numberWithCommas(usStats.money)}`)
							return emb;
						},
						retry: message => `${us} Please enter a valid number.`,
						prompt: true
					}
				}

				if (itemMenu == 1){
					let weaponTbl = JSON.parse(fs.readFileSync('IdleGame/availableWeapons.json'));
					if (weaponTbl.date != curDate){
						weaponTbl.weapons = [];
						for (let i=0;i<10;i++){
							let newItem = weapons.generateRandomItem(weaponTbl.nextId);
							weaponTbl.weapons.push(newItem);
							weaponTbl.nextId ++;
						}
						weaponTbl.weapons.sort(function(a,b){
							if (a.value > b.value){
								return 1;
							}
							return -1;
						});
						weaponTbl.date = curDate;
						fs.writeFileSync('IdleGame/availableWeapons.json',JSON.stringify(weaponTbl,null,2));
					}
					let wepStr = "";
					let x=0;
					let wepTbl = [];
					for (let i of weaponTbl.weapons){ //Can only buy each weapon from the shop once.
						let hasWep = false;
						for (let j of usStats.items.weapons){
							if (j.id == i.id) hasWep = true;
						}
						for (let ct of usStats.cultists){
							for (let wep of ct.equipment.weapons){
								if (wep.id == i.id) hasWep = true;
							}
						}
						if (!hasWep){
							wepTbl.push(i);
						}
					}
					for (let i of wepTbl){
						x++;
						wepStr += `${x} - ${i.name} - £${f.numberWithCommas(i.value)}\n`
					}
					weapon = yield{
						type: Argument.range('integer',0,wepTbl.length,true),
						prompt: {
							start: message => {
								let emb = new Discord.MessageEmbed()
								.setTitle('Weapons')
								.setDescription(wepStr)
								.setFooter(`Balance: £${f.numberWithCommas(usStats.money)}`)
								return emb;
							},
							retry: message => `${us} Please enter a valid number`,
							prompt: true
						}
					}

					weapon--;
					weapon = wepTbl[weapon];
					let weaponDesc = `Damage: ${weapon.damage} ${weapon.dmgType}\nType: ${weapon.type}\nCost: £${f.numberWithCommas(weapon.value)}`

					weaponConfirm = yield{
						type: 'yes/no',
						prompt:{
							start: message => {
								let emb = new Discord.MessageEmbed()
								.setTitle(`Are you sure you want to buy ${weapon.name}?`)
								.setDescription(weaponDesc)
								.setFooter(`Balance: £${f.numberWithCommas(usStats.money)}`)

								return emb;
							}
						}
					}
				} else if (itemMenu == 2){
					let armourTbl = JSON.parse(fs.readFileSync('IdleGame/availableArmour.json'));
					if (armourTbl.date != curDate){
						armourTbl.armour = [];
						for (let i=0;i<10;i++){
							let newItem = armour.generateRandomArmour(armourTbl.nextId);
							armourTbl.armour.push(newItem);
							armourTbl.nextId ++;
						}
						armourTbl.armour.sort(function(a,b){
							if (a.value > b.value){
								return 1;
							}
							return -1;
						});
						armourTbl.date = curDate;
						fs.writeFileSync('IdleGame/availableArmour.json',JSON.stringify(armourTbl,null,2));
					}
					let armStr = "";
					let x=0;
					let armTbl = [];
					for (let i of armourTbl.armour){ //Can only buy each weapon from the shop once.
						let hasArm = false;
						for (let j of usStats.items.armour){
							if (j.id == i.id){
								hasArm = true;
							}
						}
						for (let ct of usStats.cultists){
							let arm = ct.equipment.armour;
							if (arm.head.id == i.id) hasArm = true;
							if (arm.body.id == i.id) hasArm = true;
							if (arm.hands.id == i.id) hasArm = true;
							if (arm.legs.id == i.id) hasArm = true;
							if (arm.feet.id == i.id) hasArm = true;
						}
						if (!hasArm){
							armTbl.push(i);
						}
					}
					for (let i of armTbl){
						x++;
						armStr += `${x} - ${i.name} - £${f.numberWithCommas(i.value)}\n`
					}
					arm = yield{
						type: Argument.range('integer',0,armTbl.length,true),
						prompt: {
							start: message => {
								let emb = new Discord.MessageEmbed()
								.setTitle('Armour')
								.setDescription(armStr)
								.setFooter(`Balance: £${f.numberWithCommas(usStats.money)}`)
								return emb;
							},
							retry: message => `${us} Please enter a valid number`,
							prompt: true
						}
					}

					arm--;
					arm = armTbl[arm];
					let armourDesc = `Defence: ${arm.defence}\nType: ${arm.equip}, ${arm.type}\nCost: £${f.numberWithCommas(arm.value)}`

					armourConfirm = yield{
						type: 'yes/no',
						prompt:{
							start: message => {
								let emb = new Discord.MessageEmbed()
								.setTitle(`Are you sure you want to buy ${arm.name}?`)
								.setDescription(armourDesc)
								.setFooter(`Balance: £${f.numberWithCommas(usStats.money)}`)

								return emb;
							}
						}
					}
				}
			}

		} catch(err){
			console.log('Error parsing JSON string:', err)
		}

		return{shopMenu, cultistMenu, cultistConfirm, upgr, upgradeConfirm, itemMenu, weapon, weaponConfirm, arm, armourConfirm}
	}
	async exec(message, args) {
		try {
			const jsonStringStats = fs.readFileSync('IdleGame/stats.json');
			const players = JSON.parse(jsonStringStats);
			const jsonStringStaff = fs.readFileSync('IdleGame/availableCultists.json');
			const curStaff = JSON.parse(jsonStringStaff);
			const us = message.author;
			let usStats;

			for (let i of players){
				if (i.name == us.toString()){
					usStats = i;
				}
			}

			if (args.cultistConfirm){
				if (args.cultistConfirm.toLowerCase() == 'yes'){
					console.log('test')
					let price = args.cultistMenu.value;
					if (price > usStats.money){
						return message.channel.send(`${us} You cannot afford that cultist.`);
					} else if (usStats.maxCultists <= usStats.cultists.length){
						return message.channel.send(`${us} You cannot hire anymore cultists. Sell one, or increase your max in the /shop.`)
					}

					usStats.cultists.push(args.cultistMenu);
					usStats.money -= price;

					let writeJsonString = JSON.stringify(players, null, 2);
					fs.writeFile('IdleGame/stats.json', writeJsonString, err => {
						if (err) {
							console.log('Error writing file', err);
						}
					})
					return message.channel.send(`${us} Successfully hired ${args.cultistMenu.name}`);
				}
			}

			if (args.upgradeConfirm){
				if (args.upgradeConfirm.toLowerCase() == 'yes'){
					let upgr = args.upgr;
					if (usStats.money < upgr.cost){
						return message.channel.send(`${us} You cannot afford that upgrade.`);
					}
					upgr.onBuy(message.member);
					let newPlayers = JSON.parse(fs.readFileSync('IdleGame/stats.json'));
					let pl;
					for (let i of newPlayers){
						if (i.name == message.author.toString()){
							pl = i;
						}
					}
					pl.money -= upgr.cost;
					fs.writeFileSync('IdleGame/stats.json', JSON.stringify(newPlayers, null, 2));
					return message.channel.send(`${us} Successfully bought ${upgr.name}`);
				}
			}

			if (args.weaponConfirm){
				if (args.weaponConfirm.toLowerCase() == 'yes'){
					let wep = args.weapon;
					if (usStats.money < wep.value){
						return message.channel.send(`${us} You cannot afford that weapon.`);
					}
					usStats.money -= wep.value;
					usStats.items.weapons.push(wep);
					fs.writeFileSync('IdleGame/stats.json',JSON.stringify(players,null,2));
					return message.channel.send(`${us} Successfully bought ${wep.name}`);
				}
			}
			if (args.armourConfirm){
				if (args.armourConfirm.toLowerCase() == 'yes'){
					let arm = args.arm;
					if (usStats.money < arm.value){
						return message.channel.send(`${us} You cannot afford that armour.`);
					}
					usStats.money -= arm.value;
					usStats.items.armour.push(arm);
					fs.writeFileSync('IdleGame/stats.json', JSON.stringify(players,null,2));
					return message.channel.send(`${us} Successfully bought ${arm.name}`);
				}
			}

		} catch(err){
			console.log('Error parsing JSON string:', err)
		}
		
	}
}

module.exports = IGShopCommand;