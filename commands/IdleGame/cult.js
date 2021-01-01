const { Command, Argument } = require("discord-akairo");
const Discord = require("discord.js");
const f = require('../../functions.js');
const wepStats = require('../../IdleGame/weapons.js');
const armStats = require('../../IdleGame/armour.js');
const upgrStats = require('../../IdleGame/upgrades.js');
const pageSize = 8;

class CultCommand extends Command {
	constructor() {
		super("Cult", {
			aliases: ["Cult"],
			description: {
				name: 'Cult',
				description: 'Manage your cult'
			}
		});
	}
	async *args(message){
		const DB = this.client.db;
		const us = `<@${message.author.id}>`;
		const mem = message.member;
		var pl = await f.getCult(message.author);
		if (!pl) return message.channel.send(`${us} You don't have a cult. Type /CreateCult to get started.`);
		pl.rewards = JSON.parse(pl.rewards);
		let rew = '';
		if (pl.rewards.length != 0) rew = ` (${pl.rewards.length})`;
		const cultMenu = yield{
			type: Argument.range('integer',0,7),
			prompt: {
				start: message => {
					let emb = new Discord.MessageEmbed()
					.setTitle(pl.name)
					.setDescription(`1 - Rename\n2 - Cultists\n3 - Inventory\n4 - Rewards${rew}`)
					.setFooter(`Type 'cancel' to cancel`);

					return emb;
				},
				retry: message => `${us} Please enter a valid number`,
				prompt: true
			}
		}

		let sellItm;
		let reforgeItm;
		let eqCultist;
		let itm;
		if (cultMenu == 1){ // Menu - Rename
			let renameCult = yield{
				type: Argument.validate('string', (m, p, str) => str.length <= 50),
				prompt: {
					start: message => `${us} Enter a new name for your cult`,
					retry: message => `${us} Please enter a valid name. Limit 50 characters.`,
					prompt: true
				}
			}
			renameCult = renameCult.replace(`'`, '`');//stop dodginess hopefully.
			DB.query(`UPDATE cults SET name = '${renameCult}' WHERE owner_id = ${pl.owner_id}`);	
			return message.channel.send(`${us} Successfully renamed your cult to ${renameCult}`);
		} else if (cultMenu == 2){ //Menu - Cultists
			pl.cultists = JSON.parse(pl.cultists);

			if (pl.cultists.toString() != [].toString()){
				let cultCopy = JSON.parse(JSON.stringify(pl.cultists));
				for (let cultist of cultCopy){ //Get stats for the cultists
					let cultName = '**';
					let stat = cultist.stats;
					let stats = [];
					stats.push({name:'str',value:stat.str});
					stats.push({name:'dex',value:stat.dex});
					stats.push({name:'con',value:stat.con});
					stats.push({name:'int',value:stat.int});
					stats.push({name:'wis',value:stat.wis});
					stats.push({name:'cha',value:stat.cha});
					let bst = 0;
					let highest = {value:0};
					let highest2 = {value:0};
					for (let st of stats){
						bst += st.value;
						if (st.value > highest.value){
							highest2 = highest;
							highest = st;
						} else if (st.value > highest2.value) highest2 = st;
					}

					cultName += `${cultist.name}**`;
					cultName += ` - ${highest.name} ${highest2.name}`
					cultName += ` (bst ${bst})`
					cultist.job != 'none' ? cultName += ` - ${cultist.job}` : cultName += ` - Unassigned`;
					cultist.name = cultName;
				}
				let cultist = 0;
				let page = 0;
				while (cultist == 0 || cultist > pageSize){ //Create Pages
					let pageEmbed = f.createPage(page,cultCopy,us,`${pl.name}'s Cultists`);
					cultist = yield pageEmbed;
					if (cultist == 0) page--;
					if (cultist > pageSize) page++;
				}
				cultist += (page*pageSize);


				const cultistNum = cultist-1
				cultist = pl.cultists[cultistNum];

				const action = yield{
					type: Argument.range('integer',0,6),
					prompt: {
						start: message => {
							let emb = new Discord.MessageEmbed()
							.setTitle(cultist.name)
							.setDescription(`${f.createCultistStatString(cultist)}\nSell Price: £${f.numberWithCommas(cultist.value/2)}\n-------------------------\n1 - Give Job\n2 - Rename\n3 - Upgrade\n4 - Equip\n5 - Sell`)
							.setFooter("Type 'cancel' to cancel");
							return emb;
						},
						retry: message => `${us} Please enter a valid number.`,
						prompt: true
					} //Menu for cultist options
				}
				if (action == 1){ //Menu - Cultists - Give Job
					const job = yield{
						type: Argument.range('integer',0,5),
						prompt:{
							start: message => {
								let emb = new Discord.MessageEmbed()
								.setTitle(`Select a job`)
								.setDescription(`1 - Sacrificer (str/dex)\n2 - Researcher (int/wis)\n3 - Explorer (wis/cha)\n4 - Warrior`)
								.setFooter(`type 'cancel' to cancel`);

								return emb;
							},
							retry: message => `${us} Please enter a valid number.`,
							prompt: true
						}
					}

					function hasJobSpace(job, pl){
						let num = 0;
						for (let i of pl.cultists) if (i.job == job) num++;
						if (job == 'Sacrificer') if (num < pl.maxsacrificers) return true;
						if (job == 'Researcher') if (num < pl.maxresearchers) return true;
						if (job == 'Explorer') return true;
						if (job == 'Warrior') if (num < 3) return true;
						return false
					}
					if (job == 1){
						if (hasJobSpace('Sacrificer', pl)) cultist.job = 'Sacrificer';
						else return message.channel.send(`${us} You do not have any free altars. Buy more from the /shop.`);	
					}
					if (job == 2){
						if (hasJobSpace('Researcher', pl)) cultist.job = 'Researcher';
						else return message.channel.send(`${us} You do not have any free libraries. Buy more from the /shop.`);
					}
					if (job == 3){
						cultist.job = "Explorer";
					}
					if (job == 4){
						if (hasJobSpace('Warrior', pl)) cultist.job = 'Warrior';
						else return message.channel.send(`${us} You may only have three warriors.`);
					}
					DB.query(`UPDATE cults SET cultists = '${JSON.stringify(pl.cultists)}' WHERE owner_id = ${pl.owner_id}`);
					return message.channel.send(`${us} ${cultist.name} is now a ${cultist.job}`);
				}
				if (action == 2){ //Menu - Cultists - Rename
					const rename = yield{
						type: "string",
						prompt:{
							start: message => `${us} Enter the new name for ${cultist.name}.`,
							retry: message => `${us} Please enter a valid name.`,
							prompt: true
						}
					}
					let oldName = cultist.name;
					cultist.name = rename;
					DB.query(`UPDATE cults SET cultists = '${JSON.stringify(pl.cultists)}' WHERE owner_id = ${pl.owner_id}`);
					return message.channel.send(`${us} Successfully changed the name of '${oldName}'' into '${rename}'.`);
				}
				if (action == 4){ //Menu - Cultists - Equip
					while (true){
						let pl = await f.getCult(message.author);
						pl.cultists = JSON.parse(pl.cultists);
						cultist = pl.cultists[cultistNum];
						pl.items = JSON.parse(pl.items);
						let equipStr = '';
						const armour = cultist.equipment.armour;
						const wep1 = cultist.equipment.weapons[0];
						const wep2 = cultist.equipment.weapons[1];

						let equipped = []; //Make array of all equipped stuff.
						equipped.push(armour.head);
						equipped.push(armour.body);
						equipped.push(armour.hands);
						equipped.push(armour.legs);
						equipped.push(armour.feet);
						equipped.push(wep1);
						equipped.push(wep2);
						equipStr += `1 - Head - ${equipped[0].name}\n`;
						equipStr += `2 - Body - ${equipped[1].name}\n`;
						equipStr += `3 - Hands - ${equipped[2].name}\n`;
						equipStr += `4 - Legs - ${equipped[3].name}\n`;
						equipStr += `5 - Feet - ${equipped[4].name}\n`;
						equipStr += `6 - Weapon1 - ${equipped[5].name}\n`;
						equipStr += `7 - Weapon2 - ${equipped[6].name}\n`;
						equipStr += ``
						
						const equipMenu = yield{
							type: Argument.range('integer', 0,8),
							prompt: {
								start: message => {
									let emb = new Discord.MessageEmbed()
									.setTitle('Equip')
									.setDescription(equipStr)
									.setFooter('type \'cancel\' to cancel.')

									return emb;
								},
								retry: message => `${us} Please enter a valid number`,////
								prompt: true
							}//Make embed for equipment
						}
						
						let curEquip = equipped[equipMenu-1]; //Currently equipped weapon
						let equipType;
						if (equipMenu == 1) equipType = 'head'; //| Have to manually do this in case they currently
						if (equipMenu == 2) equipType = 'body'; //| have nothing equipped in that slot
						if (equipMenu == 3) equipType = 'hands';
						if (equipMenu == 4) equipType = 'legs';
						if (equipMenu == 5) equipType = 'feet';
						if (equipMenu > 5) equipType = 'weapon';
						let armTbl = []; //Array of all weapons that are equippable to selected slot.
						if (equipType == 'weapon'){
							for (let i of pl.items.weapons){
								armTbl.push(i); //Push all weapons into the array
							}
						} else{
							for (let i of pl.items.armour){
								if (i.equip == equipType){ //Push all armour equippable to the slot to the array.
									armTbl.push(i);
								}
							}
						}
						let loop = false;
						if (!curEquip.id && armTbl.length == 0){
							message.channel.send(`${us} You have no equipment of that type.`);
							loop = true;
						}

						if (!loop){
							if (curEquip.id){
								armTbl.unshift({ //If they have something equipped, give the option to unequip it.
									name: 'none',
									equip: equipType,
									type: 'One Handed'
								})
							}

							let newArmTbl = JSON.parse(JSON.stringify(armTbl)); //copy by value.
							for (let arm of newArmTbl){ //Create the duplicate table so we can add info to item names.
								if (arm.name == 'none' && !arm.base) arm.name = `Unequip`;
								else if (equipType == 'weapon') arm.name += ` - ${arm.damage} damage`;
								else arm.name += ` - ${arm.defence} defence`;
							}

							let chooseEquip = 0;
							let page = 0;
							while (chooseEquip == 0 || chooseEquip > pageSize){
								let pageEmbed = f.createPage(page,newArmTbl,us,f.capitalise(equipType));
								chooseEquip = yield{
									type: pageEmbed.type,
									prompt:pageEmbed.prompt
								}
								if (chooseEquip == 0) page--;
								if (chooseEquip > pageSize) page++;//Create pages for equippable items
							}
							chooseEquip += (page*pageSize);
							pl = await f.getCult(message.author); //Now time has passed, so we need to regain info in case it changed.
							pl.items = JSON.parse(pl.items);
							pl.cultists = JSON.parse(pl.cultists);
							for (let ct of pl.cultists){
								if (ct.id == cultist.id) cultist = ct; //Re-select the cultist we had before.
							}
							let arm = armTbl[chooseEquip-1]; //The item we want to equip.
							let region = arm.equip;
							if (equipType == 'weapon' && (arm.type == 'One Handed' || arm.type == 'Thrown')) region = 1;
							else if (arm.damage) region = 2;
							let equip = cultist.equipment;
							let old; //The item you're replacing
							let old2; //If we're replacing more than one item
							let equipTbl;
							if (region == 'head'){ //Equip to head
								old = equip.armour.head;
								equip.armour.head = arm;
								equipTbl = pl.items.armour;
							} 
							if (region == 'body'){ //Equip to body
								old = equip.armour.body;
								equip.armour.body = arm;
								equipTbl = pl.items.armour;
							}
							if (region == 'hands'){ //Equip to hands
								old = equip.armour.hands;
								equip.armour.hands = arm;
								equipTbl = pl.items.armour;
							} 
							if (region == 'legs'){ //Equip to legs
								old = equip.armour.legs;
								equip.armour.legs = arm;
								equipTbl = pl.items.armour;
							}
							if (region == 'feet'){ //Equip to feet
								old = equip.armour.feet;
								equip.armour.feet = arm;
								equipTbl = pl.items.armour;
							}
							if (region == 1){ //Equipping a one-handed weapon
								old = equip.weapons[equipMenu-6];
								old2 = equip.weapons[0]; //Need to check the currently equipped weapon isn't two-handed
								if (old2.type != 'Thrown' && old2.type != 'One Handed'){
									old = old2; //Remove the primary weapon instead.
									equip.weapons[0] = {name:'none'} //Clear this slot.
								}
								old2 = {}; //We should never have to remove two weapons when equipping a one-handed weapon.
								equip.weapons[equipMenu-6] = arm;
								equipTbl = pl.items.weapons;
							}
							if (region == 2){ //Equipping a two-handed weapon
								old = equip.weapons[0];
								old2 = equip.weapons[1];
								equip.weapons[0] = arm;
								equip.weapons[1] = {
									name: 'none',
									damage: 0
								};
								equipTbl = pl.items.weapons;
							}
							let x = 0;
							for (let i of equipTbl){
								if (i.id == arm.id){
									equipTbl.splice(x,1);//Delete the selected item from inventory.
								}
								x++;
							}
							if (!old) old = {};
							if (!old2) old2 = {}; //To prevent errors when fetching the id.
							let placed = '';
							if (old.id){ //if the old item had an id (not nothing)
								equipTbl.push(old); //put it in bag
								placed = ` Placed ${old.name} in your bag.`;
							} if (old2.id){
								equipTbl.push(old2);
								if (!old.name){
									placed = ` Placed ${old2.name} in your bag.`;
								}else {
									placed = ` Placed ${old.name} and ${old2.name} in your bag.`;
								}
							}
							let mes;
							if (!arm.id){
								mes = `${us} Unequipped ${old.name} and placed it in your bag.`;
							} else mes = `${us} Equipped ${cultist.name} with ${arm.name}.${placed}`;
							let query = `
							UPDATE cults
							SET items = '${JSON.stringify(pl.items)}',
							cultists = '${JSON.stringify(pl.cultists)}'
							WHERE owner_id = ${pl.owner_id}
							`;
							await DB.query(query);
							message.channel.send(mes);
						}
					}
				}
				if (action == 5){ //Menu - Cultists - Sell
					const confirmSell = yield{
						type: "yes/no",
						prompt:{
							start: message => `${us} Are you sure you want to sell ${cultist.name}? This cannot be undone.`,
							retry: message => `${us} Please enter \`yes\` or \`no\`.`,
							prompt: true
						}
					}
					if (confirmSell == 'yes'){
						pl = await f.getCult(message.author);
						pl.money = Number(pl.money);
						pl.cultists = JSON.parse(pl.cultists);
						message.channel.send(`${us} Successfully sold ${cultist.name} for £${f.numberWithCommas(cultist.value/2)}`);
						pl.money += (cultist.value/2);
						pl.cultists.splice(cultistNum,1);
						let query = `
						UPDATE cults
						SET money = ${pl.money},
						cultists = '${JSON.stringify(pl.cultists)}'
						WHERE owner_id = ${pl.owner_id}
						`
						DB.query(query);
						return
					} else{
						return message.channel.send(`${us} ${cultist.name} has not been sold.`)
					}
				}
			} else {
				return message.channel.send(`${us} You do not own any cultists yet. Type /shop to buy some.`);
			}
		} else if (cultMenu == 3){ // Menu - Inventory
			pl.items = JSON.parse(pl.items);
			const invMenu = yield{
				type: Argument.range('integer',0,4),
				prompt: {
					start: message => {
						let emb = new Discord.MessageEmbed()
						.setTitle('Inventory')
						.setDescription(`1 - Weapons\n2 - Armour\n3 - Misc Items`)
						.setFooter(`type 'cancel' to cancel`);

						return emb;
					},
					retry: message => `${us} Please enter a valid number`,
					prompt: true
				}
			}

			if (invMenu == 1 || invMenu == 2){ //Menu - Inventory - Weapons/Armour
				let itmArr;
				let itmType;
				if (invMenu == 1){
					itmArr = pl.items.weapons;
					if (itmArr.length == 0) return message.channel.send(`${us} You have no weapons in your inventory.`);
					itmType = 'Weapons';
				}
				if (invMenu == 2){
					itmArr = pl.items.armour;
					if (itmArr.length == 0) return message.channel.send(`${us} You have no armour in your inventory.`);
					itmType = 'Armour';
				}
				let itmMenu = 0;
				let page = 0;
				while (itmMenu == 0 || itmMenu > pageSize){
					let pageEmbed = f.createPage(page,itmArr,us,`${pl.name}'s Cultists`);
					itmMenu = yield{
						type: pageEmbed.type,
						prompt:pageEmbed.prompt
					}
					if (itmMenu == 0) page--;
					if (itmMenu > pageSize) page++;
				}
				itmMenu += (page*pageSize);

				itm = itmArr[itmMenu-1]
				let desc;
				if (itmType == 'Weapons'){
					let statStr = ''
					for (let st of itm.stat){
						statStr += st;
						if (st != itm.stat[itm.stat.length-1]) statStr += ', ';
					}
					desc = `${itm.damage} ${itm.dmgType} damage\nType: ${itm.type}\nStat: ${statStr}`
				} else {
					desc = `${itm.defence} defence\nType: ${itm.type}\nEquip region: ${itm.equip}`
				}

				const itmAction = yield{
					type: Argument.range('integer',0,4),
					prompt: {
						start: message => {
							let emb = new Discord.MessageEmbed()
							.setTitle(itm.name)
							.setDescription(`${desc}\nSell value: ${f.numberWithCommas(itm.value/2)}\n-------------\n1 - Equip\n2 - Reforge\n3 - Sell`)
							.setFooter(`type 'cancel' to cancel`);
							return emb;
						}
					}
				}

				if (itmAction == 1){ //Menu - Inventory - Wep/Arm - Equip
					pl.cultists = JSON.parse(pl.cultists);
					if (pl.cultists.length == 0) return message.channel.send(`${us} You have no cultists to equip this item to.`)
					let cultTbl = [];
					let cultStr = '';
					let x = 1;
					for (let cultist of pl.cultists){
						cultTbl.push(cultist);
						cultStr += `${x} - ${cultist.name}\n`;
						x++;
					}

					eqCultist = yield{
						type: Argument.range('integer',0,cultTbl.length,true),
						prompt: {
							start: message => {
								let emb = new Discord.MessageEmbed()
								.setTitle('Equip to which cultist?')
								.setDescription(cultStr)
								.setFooter(`type 'cancel' to cancel`)

								return emb;
							},
							retry: message => `${us} Please enter a valid number`,
							prompt: true
						}
					}
					pl = await f.getCult(message.author);
					pl.items = JSON.parse(pl.items);
					pl.cultists = JSON.parse(pl.cultists);
					eqCultist--;
					let ct = cultTbl[eqCultist];

					for (let cult of pl.cultists){
						if (cult.id == ct.id) ct = cult;
					}

					let weps = pl.items.weapons;
					if (itmType == 'Weapons'){
						let x = 0;
						let wepIndex;
						for (let wep of pl.items.weapons){ //Find weapon index so we can remove from inventory
							if (wep.id == itm.id) wepIndex = x;
							x++;
						}
						x = 0;
						let empty = -1;
						for (let wep of ct.equipment.weapons){
							if (wep.type != 'One Handed' && wep.type != 'Thrown' && wep.name != 'none'){ //If it's equipped with a two handed weapon, we can immediately unequip it.
								ct.equipment.weapons[0] = itm;
								pl.items.weapons.splice(wepIndex, 1);
								pl.items.weapons.push(wep);
								let query = `
								UPDATE cults
								SET items = '${JSON.stringify(pl.items)}',
								cultists = '${JSON.stringify(pl.cultists)}'
								WHERE owner_id = ${pl.owner_id}
								`;
								DB.query(query);
								return message.channel.send(`${us} Equipped ${ct.name} with ${itm.name}. Returned ${wep.name} to your bag.`)
							}
							if (wep.name == 'none' && empty == -1) empty = x; //Find first empty hand to equip to if possible.
							x++;
						}
						if (itm.type == 'One Handed' || itm.type == 'Thrown'){
							if (empty){
								ct.equipment.weapons[empty] = itm;
								pl.items.weapons.splice(wepIndex, 1);
								let query = `
								UPDATE cults
								SET items = '${JSON.stringify(pl.items)}',
								cultists = '${JSON.stringify(pl.cultists)}'
								WHERE owner_id = ${pl.owner_id}
								`;
								DB.query(query);
								return message.channel.send(`${us} Equipped ${ct.name} with ${itm.name}`);
							} else{
								let eqSlot = yield{
									type:Argument.range('integer',0,2),
									prompt: {
										start: message => {
											let emb = new Discord.MessageEmbed()
											.setTitle('Equip to which slot?')
											.setDescription(`1 - ${weps[0].name} (${weps[0].damage} ${weps[0].dmgType} damage)\n2 - ${weps[1].name} (${weps[1].damage} ${weps[1].dmgType} damage)`)
											.setFooter(`type 'cancel' to cancel`)
										},
										retry: message => `${us} Please enter a valid number`,
										prompt: true
									}
								}
								eqSlot--;
								let old = ct.equipment.weapons[eqSlot];
								let wepStr = '';
								if (old.name != 'none'){
									weps.push(old);
									wepStr = ` Placed ${old.name} in your bag.`
								}
								ct.equipmenet.weapons[eqSlot] = itm;
								weps.splice(wepIndex, 1);
								let query = `
								UPDATE cults
								SET items = '${JSON.stringify(pl.items)}',
								cultists = '${JSON.stringify(pl.cultists)}'
								WHERE owner_id = ${pl.owner_id}
								`;
								DB.query(query);
								return message.channel.send(`${us} Equipped ${ct.name} with ${itm.name}.`)
							}
						} else {
							let old1;
							let old2;
							if (ct.equipment.weapons[0].name != 'none') old1 = ct.equipment.weapons[0];
							if (ct.equipment.weapons[1].name != 'none') old2 = ct.equipment.weapons[1];
							ct.equipment.weapons[0] = itm;
							ct.equipment.weapons[1] = {name: 'none'};
							let wepStr = '';
							if (old1 || old2) wepStr = ' Placed';
							if (old1){
								weps.push(old1);
								wepStr += ` ${old1.name}`;
							}
							if (old1 && old2) wepStr += ' and';
							if (old2){
								weps.push(old2);
								wepStr += ` ${old2.name}`;
							}
							if (old1 || old2) wepStr += ` in your bag.`;
							weps.splice(wepIndex,1);
							let query = `
							UPDATE cults
							SET items = '${JSON.stringify(pl.items)}',
							cultists = '${JSON.stringify(pl.cultists)}'
							WHERE owner_id = ${pl.owner_id}
							`;
							DB.query(query);
							return message.channel.send(`${us} Equipped ${ct.name} with ${itm.name}.${wepStr}`)
						}
					} else{
						let eqp;
						let arm = ct.equipment.armour;
						let armIndex;
						let x = 0;
						for (let armour of pl.items.armour){
							if (armour.id == itm.id) armIndex = x;
							x++;
						}

						if (itm.equip == 'head'){
							eqp = arm.head;
							arm.head = itm;
						} 
						if (itm.equip == 'body'){
							eqp = arm.body;
							arm.body = itm;
						}
						if (itm.equip == 'hands'){
							eqp = arm.hands;
							arm.hands = itm;
						}
						if (itm.equip == 'legs'){
							eqp = arm.legs;
							arm.legs = itm;
						}
						if (itm.equip == 'feet'){
							eqp = arm.feet;
							arm.geet = itm;
						}

						let armStr = '';
						if (eqp.name != 'none'){
							armStr = ` Placed ${eqp.name} in your bag.`;
							pl.items.armour.push(eqp);
						}
						pl.items.armour.splice(armIndex,1);
						let query = `
						UPDATE cults
						SET items = '${JSON.stringify(pl.items)}',
						cultists = '${JSON.stringify(pl.cultists)}'
						WHERE owner_id = ${pl.owner_id}
						`;
						DB.query(query);
						return message.channel.send(`${us} Equipped ${ct.name} with ${itm.name}.${armStr}`)
					}
				}
				if (itmAction == 2){ //Menu - Inventory - Wep/Arm - Reforge
					reforgeItm = yield{
						type: 'yes/no',
						prompt: {
							start: message => `${us} Reforging this item will cost £${f.numberWithCommas(Math.floor(itm.value/750)*250)}. Are you sure you wish to reforge?`,
							retry: message => `${us} Please enter 'yes' or 'no'`,
							prompt: true
						}
					}
					if (reforgeItm == 'yes'){
						pl = await f.getCult(message.author);
						pl.items = JSON.parse(pl.items);
						pl.money = Number(pl.money);
						if (itm.value >= pl.money){
							return message.channel.send(`${us} You cannot afford to reforge this item.`);
						}
						else{
							if (itm.damage){ //Have to do weapons and armour separately for this one.
								let wep;
								let pl = await f.getCult(message.author);
								pl.items = JSON.parse(pl.items);
								pl.money = Number(pl.money);
								for (let weapon of pl.items.weapons){
									if (weapon.id == itm.id) wep = weapon;
								}
								let oldPref;
								if (wep.prefix){
									for (let pref of wepStats.prefixes){ //Find the prefix the weapon has.
										if (pref.id == wep.prefix) oldPref = pref;
									}
									wep.damage = Math.floor(wep.damage / oldPref.damage); //Revert changes to stats made by prefix.
									wep.value = Math.floor(wep.value / oldPref.value); // This will over time reduce stats of the weapon slowly, but this works thematically so I'm keeping it.
								}
								
								for (let base of wepStats.bases){
									if (base.id == wep.base){
										wep.type = base.type; //Make sure to revert type back to what it should be if prefix overrode it
									}
								}
								
								let prefixType = false;
								let pref;
								while (!prefixType){ //Make sure the prefix is allowed on that weapon type
									pref = f.arrRandom(wepStats.prefixes)
									for (let typ of pref.types){
										if (typ == wep.type) prefixType = true;
									}
								}
								
								wep.damage = Math.floor(wep.damage*pref.damage);
								wep.value = Math.floor(wep.value*pref.value/250)*250;
								if (pref.overrideType) wep.type = pref.overrideType;
								let oldName = wep.name;
								let newName = wep.name.replace(oldPref.name,pref.name);
								wep.prefix = pref.id;
								wep.name = newName;
								pl.money -= Math.floor(wep.value/750)*250;
								let query = `
								UPDATE cults
								SET money = ${pl.money},
								items = '${JSON.stringify(pl.items)}'
								WHERE owner_id = ${pl.owner_id}
								`;
								DB.query(query);
								return message.channel.send(`${us} Reforged \`${oldName}\` into \`${newName}\``)
							}
							else{
								return message.channel.send(`${us} Reforging armour is currently not implemented.`)
							}
						}
					}
				}
				if (itmAction == 3){ //Menu - Inventory - Sell
					sellItm = yield{
						type: 'yes/no',
						prompt: {
							start: message => `${us} Are you sure you want to sell ${itm.name} for £${f.numberWithCommas(itm.value/2)}?`,
							retry: message => `${us} Please enter 'yes' or 'no'`,
							prompt: true
						}
					}

					if (sellItm == 'yes'){
						pl = await f.getCult(message.author);
						pl.items = JSON.parse(pl.items);
						pl.money = Number(pl.money);
						let equipTbl;
						if (itm.damage) equipTbl = pl.items.weapons;
						else equipTbl = pl.items.armour;

						pl.money += itm.value/2;

						let x = 0;
						for (let i of equipTbl){
							if (i.id == itm.id){
								equipTbl.splice(x,1);
							}
							x++;
						}
						let query = `
						UPDATE cults
						SET money = ${pl.money},
						items = '${JSON.stringify(pl.items)}'
						WHERE owner_id = ${pl.owner_id}
						`
						DB.query(query);
						return message.channel.send(`${us} Sold ${itm.name} for £${f.numberWithCommas(itm.value/2)}`)
					} else{
						return message.channel.send(`${us} ${itm.name} was not sold.`)
					}
				}
				
			}
		} else if (cultMenu == 4){ //Menu - Rewards
			if (pl.rewards.length == 0) return message.channel.send(`${us} You have no rewards to claim`)
			let page = 0;
			let rewardEmb = 0;

			while (rewardEmb == 0 || rewardEmb == pageSize+1){
				let minNum = 'claim';
				let maxNum = 'claim';
				if ((page+1)*pageSize < pl.rewards.length) maxNum = pageSize+1;
				if (page != 0) minNum = 0;
				let pageEmbed = f.createPage(page, pl.rewards,us,`Type 'claim' to claim rewards`);
				rewardEmb = yield{
					type: [[minNum.toString()], ['claim'], [maxNum.toString()]],
					prompt: pageEmbed.prompt
				}
				if (rewardEmb == 0) page--;
				if (rewardEmb == pageSize+1) page++;
			}

			if (rewardEmb.toLowerCase() == 'claim'){
				pl.items = JSON.parse(pl.items);
				for (let rew of pl.rewards){
					if (rew.damage)	pl.items.weapons.push(rew);
					if (rew.equip) pl.items.armour.push(rew);
				}
				pl.rewards = '[]';
				pl.items = JSON.stringify(pl.items);
				let query = `
				UPDATE cults
				SET rewards = '${pl.rewards}',
				items = '${pl.items}'
				WHERE owner_id = ${pl.owner_id}
				`
				DB.query(query);
				return message.channel.send(`${us} Successfully claimed your rewards`);
			} else return message.channel.send(`${us} Your rewards were not claimed`);
		}
	}
	exec(message, args) {

	}
}

module.exports = CultCommand;