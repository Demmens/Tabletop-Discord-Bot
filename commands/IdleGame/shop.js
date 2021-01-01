const { Command, Argument } = require("discord-akairo");
const Discord = require("discord.js");
const f = require('../../functions.js');
const upgrades = require(`../../IdleGame/upgrades.js`);
const weapons = require(`../../IdleGame/weapons.js`);
const armour = require(`../../IdleGame/armour.js`);

class IGShopCommand extends Command {
	constructor() {
		super("Shop", {
			aliases: ["Shop"],
			description: {
				name: 'shop',
				description: 'Buy things'
			}
		});
	}
	async *args(message){
		let d = new Date();
		let curDate = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
		const DB = this.client.db;

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

		let cultistMenu; 	//Create vars here so we can just return them all at the end and save lots of work.
		let cultistConfirm;	//  Comment above is no longer relevant since I merged all the code into the
		let upgradeConfirm; //  args function. I can't be arsed to go over all the variables though.
		let upgr;
		let itemMenu;
		let weapon;
		let weaponConfirm;
		let arm;
		let armourConfirm;

		const us = `<@${message.author.id}>`;
		var ply = await f.getCult(message.author);
		if (!ply) return message.channel.send(`${us} you must first create a cult. Type /CreateCult to get started`)
		let query = `
				SELECT * FROM itemshop
				WHERE guild_id = ${message.guild.id}
				`;
		let shop = (await DB.query(query)).rows[0];
		let idleGame = (await DB.query(`SELECT * FROM idlegame`)).rows[0];
		idleGame.nextcultistid = Number(idleGame.nextcultistid);
		idleGame.nextitemid = Number(idleGame.nextitemid);
		if (!shop){ //if the shop doesn't exist.
			shop = {
				guild_id: message.guild.id,
				cultistshop: `{"date":0}`,
				weaponshop: `{"date":0}`,
				armourshop: `{"date":0}`,
				miscshop: `{"date":0}`,
				isNewShop: true
			}
		}
		const numCultists = 10; //Number of cultists in the shop

		if (shopMenu == 2){
			let cultshop = JSON.parse(shop.cultistshop)
			if (cultshop.date != curDate){ //If the shop is outdated
				cultshop.cultists = [];
				for (let i=0;i<numCultists;i++){
					let cultist = f.CreateCultist();
					cultist.id = idleGame.nextcultistid
					idleGame.nextcultistid++;
					cultshop.cultists.push(cultist);
				}
				let query;
				cultshop.date = curDate;
				if (shop.isNewShop){
					query = `
					INSERT INTO itemshop(
					guild_id,cultistshop,weaponshop,armourshop,miscshop)
					VALUES (${shop.guild_id},'${JSON.stringify(cultshop)}','${shop.weaponshop}','${shop.armourshop}','${shop.miscshop}')
					`;
				} else{
					query = `
					UPDATE itemshop
					SET cultistshop = '${JSON.stringify(cultshop)}'
					WHERE guild_id = ${shop.guild_id}
					`
				}
				DB.query(query);
				DB.query(`UPDATE idlegame SET nextcultistid = ${idleGame.nextcultistid}`);
			} 
			
			let plyCultists = JSON.parse(ply.cultists)
			let unOwned = [];
			for(let i of cultshop.cultists){
				let owned = [];
				let isOwned = false;
				for (let c of plyCultists){
					if (c.id == i.id){
						owned.push(i);
						isOwned = true;
					}
				}
				if (!isOwned){
					unOwned.push(i);
				}
			}
			unOwned.sort(function(a,b){return a.value-b.value})

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
						.setTitle(`Cultists (${plyCultists.length}/${ply.maxcultists} owned)`)
						.setDescription(desc)
						.setFooter(`Balance: £${f.numberWithCommas(ply.money)}`)

						return emb;
					},
					retry: message => `${us} Please enter a valid number.`,
					prompt: true
				}
			}

			cultistMenu = unOwned[cultistMenu-1]
			let embed = new Discord.MessageEmbed()
			.setTitle(`Hire ${cultistMenu.name}?`)
			.setDescription(`${f.createCultistStatString(cultistMenu)}\nCost: £${f.numberWithCommas(cultistMenu.value)}`);

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

			if (cultistConfirm.toLowerCase() == 'yes'){
				ply.money = Number(ply.money);
				let price = cultistMenu.value;
				if (price > ply.money){
					return message.channel.send(`${us} You cannot afford that cultist.`);
				} else if (ply.maxcultists <= plyCultists.length){
					return message.channel.send(`${us} You cannot hire anymore cultists. Sell one, or increase your max in the /shop.`)
				}

				plyCultists.push(cultistMenu);
				ply.money -= price;
				let query = `
				UPDATE cults
				SET 
				money = ${ply.money},
				cultists = '${JSON.stringify(plyCultists)}'
				WHERE owner_id = ${ply.owner_id}
				`;
				DB.query(query);
				return message.channel.send(`${us} Successfully hired ${cultistMenu.name}`);
			}

		} else if(shopMenu == 1){
			let avUpgr = [];
			ply.upgrades = JSON.parse(ply.upgrades);
			
			for (let i of upgrades.oneTime){ //Run through all one time purchase upgrades
				let hasUpgr = false;
				let hasReq = false;
				for (let j of ply.upgrades.oneTime){ //Run through all one time upgrades the player owns
					if (i.id == j){ //Check for matches.
						hasUpgr = true
					}
				}
				if (!hasUpgr && i.requirements(ply)){ //If they don't have it, and they have the requirements, then make it an available upgrade.
					avUpgr.push(i)
				}
			}

			for (let i of upgrades.repeatable){
				let temp = {...i}; //Create this so we don't constantly increase the price each time we look at the shop.
				for (let j of ply.upgrades.repeatable){
					if (temp.id == j.id){
						temp.cost = Math.floor(i.cost*Math.pow(1.5,j.number)/250)*250;
					}
				}

				if (i.requirements(ply)){
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
						.setFooter(`Balance: £${f.numberWithCommas(ply.money)}`)
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

			if (upgradeConfirm.toLowerCase() == 'yes'){
				if (ply.money < upgr.cost){
					return message.channel.send(`${us} You cannot afford that upgrade.`);
				}
				ply = await f.getCult(message.author); //A lot can have changed in response times.
				ply.money = Number(ply.money);
				ply.upgrades = JSON.parse(ply.upgrades);
				upgr.onBuy(ply);
				ply.money -= upgr.cost;
				ply.upgrades = JSON.stringify(ply.upgrades);
				f.fullWriteCults(ply); //Update all values since upgrades can update a lot of things.
				return message.channel.send(`${us} Successfully bought ${upgr.name}`);
			}

		} else if (shopMenu == 3){
			itemMenu = yield{
				type: Argument.range('integer',0,4),
				prompt: {
					start: message => {
						let emb = new Discord.MessageEmbed()
						.setTitle('Items')
						.setDescription('1 - Weapons\n2 - Armour\n3 - Misc')
						.setFooter(`Balance: £${f.numberWithCommas(ply.money)}`)
						return emb;
					},
					retry: message => `${us} Please enter a valid number.`,
					prompt: true
				}
			}

			if (itemMenu == 1){
				let weaponTbl = JSON.parse(shop.weaponshop);
				if (weaponTbl.date != curDate){
					weaponTbl.weapons = [];
					for (let i=0;i<10;i++){
						let newItem = weapons.generateRandomItem(idleGame.nextitemid);
						weaponTbl.weapons.push(newItem);
						idleGame.nextitemid++;
					}
					weaponTbl.weapons.sort(function(a,b){
						if (a.value > b.value){
							return 1;
						}
						return -1;
					});
					weaponTbl.date = curDate;
					if (shop.isNewShop){
						query = `
						INSERT INTO itemshop(
						guild_id,cultistshop,weaponshop,armourshop,miscshop)
						VALUES (${shop.guild_id},'${shop.cultistshop}','${JSON.stringify(weaponTbl)}','${shop.armourshop}','${shop.miscshop}')
						`;
					} else{
						query = `
						UPDATE itemshop
						SET weaponshop = '${JSON.stringify(weaponTbl)}'
						WHERE guild_id = ${shop.guild_id}
						`
					}
					DB.query(query);
					DB.query(`UPDATE idlegame SET nextitemid = ${idleGame.nextitemid}`);
				}
				let wepStr = "";
				let x=0;
				let wepTbl = [];
				ply.items = JSON.parse(ply.items);
				ply.cultists = JSON.parse(ply.cultists);
				for (let i of weaponTbl.weapons){ //Can only buy each weapon from the shop once.
					let hasWep = false;
					for (let j of ply.items.weapons){
						if (j.id == i.id) hasWep = true;
					}
					for (let ct of ply.cultists){
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
							.setFooter(`Balance: £${f.numberWithCommas(ply.money)}`)
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
							.setFooter(`Balance: £${f.numberWithCommas(ply.money)}`)

							return emb;
						}
					}
				}

				if (weaponConfirm.toLowerCase() == 'yes'){
					ply = (await DB.query(`SELECT * FROM cults where owner_id = ${ply.owner_id}`)).rows[0];
					ply.money = Number(ply.money);
					ply.items = JSON.parse(ply.items);
					if (ply.money < weapon.value){
						return message.channel.send(`${us} You cannot afford that weapon.`);
					}
					ply.money -= weapon.value;
					ply.items.weapons.push(weapon);
					let query = `
					UPDATE cults
					SET items = '${JSON.stringify(ply.items)}',
					money = ${ply.money}
					WHERE owner_id = ${ply.owner_id}
					`
					DB.query(query);
					return message.channel.send(`${us} Successfully bought ${weapon.name}`);
				}
			} else if (itemMenu == 2){
				let armourTbl = JSON.parse(shop.armourshop);
				if (armourTbl.date != curDate){
					armourTbl.armour = [];
					for (let i=0;i<10;i++){
						let newItem = armour.generateRandomArmour(idleGame.nextitemid);
						armourTbl.armour.push(newItem);
						idleGame.nextitemid ++;
					}
					armourTbl.armour.sort(function(a,b){
						if (a.value > b.value){
							return 1;
						}
						return -1;
					});
					armourTbl.date = curDate;
					if (shop.isNewShop){
						query = `
						INSERT INTO itemshop(
						guild_id,cultistshop,weaponshop,armourshop,miscshop)
						VALUES (${shop.guild_id},'${shop.cultistshop}','${shop.weaponshop}','${JSON.stringify(armourTbl)}','${shop.miscshop}')
						`;
					} else{
						query = `
						UPDATE itemshop
						SET armourshop = '${JSON.stringify(armourTbl)}'
						WHERE guild_id = ${shop.guild_id}
						`
					}
					DB.query(query);
					DB.query(`UPDATE idlegame SET nextitemid = ${idleGame.nextitemid}`);
				}
				let armStr = "";
				let x=0;
				let armTbl = [];
				ply.items = JSON.parse(ply.items);
				ply.cultists = JSON.parse(ply.cultists);
				for (let i of armourTbl.armour){ //Can only buy each weapon from the shop once.
					let hasArm = false;
					for (let j of ply.items.armour){
						if (j.id == i.id){
							hasArm = true;
						}
					}
					for (let ct of ply.cultists){
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
							.setFooter(`Balance: £${f.numberWithCommas(ply.money)}`)
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
							.setFooter(`Balance: £${f.numberWithCommas(ply.money)}`)

							return emb;
						}
					}
				}

				if (armourConfirm.toLowerCase() == 'yes'){
					ply = (await DB.query(`SELECT * FROM cults WHERE owner_id = ${ply.owner_id}`)).rows[0];
					ply.money = Number(ply.money);
					ply.items = JSON.parse(ply.items);
					if (ply.money < arm.value){
						return message.channel.send(`${us} You cannot afford that armour.`);
					}
					ply.money -= arm.value;
					ply.items.armour.push(arm);
					
					let query = `
					UPDATE cults
					SET items = '${JSON.stringify(ply.items)}',
					money = ${ply.money}
					WHERE owner_id = ${ply.owner_id}
					`
					DB.query(query);		
					return message.channel.send(`${us} Successfully bought ${arm.name}`);
				}
			}
		}
	}
	async exec(message, args) {
		
	}
}

module.exports = IGShopCommand;