const { Command, Argument } = require("discord-akairo");
const Discord = require("discord.js");
const f = require('../../functions.js');
const armourTbl = require('../../IdleGame/armour.js');
const weaponTbl = require('../../IdleGame/weapons.js');
const Monster = require('../../IdleGame/Monster');
const conditions = require('../../IdleGame/conditions.js')
const fs = require('fs');
const path = require('path');
const challengedRecently = new Set();

class ChallengeCommand extends Command {
	constructor() {
		super("Challenge", {
			aliases: ["challenge", "fight", "battle"],
			description: "Challenge someone to a fight.",
			cooldown: 5000
		});
	}
	async *args(message){
		const DB = this.client.db;
		const us = `<@${message.author.id}>`;
		if (challengedRecently.has(message.author.id)) return;
		let ply = await f.getCult(message.author);
		ply.cultists = JSON.parse(ply.cultists);
		const highestLevel = 10;
		const resistanceReduction = 1.5;
		const weaknessIncrease = 1.5;

		let monstArr = [];
		const dir = fs.readdirSync('IdleGame/monsters'); //retrieve all monsters
		for (let file of dir){
			let filepath = path.join('../../IdleGame/monsters',file);
			filepath = filepath.replace(path.extname(filepath), '');
			let monster = require(filepath);
			monstArr.push(new monster);
		}

		const level = yield{
			type: Argument.range('integer',-1,highestLevel, true),
			prompt:{
				start: message => `${us} What level combat do you wish to fight?`,
				retry: message => `${us} Please enter a number between 0 and ${highestLevel}`,
				prompt:true
			}//Choose combat level
		}

		let monsters = [];
		for (let mon of monstArr) if (mon.level == level) monsters.push(mon);
		if (monsters.length == 0) return message.channel.send(`${us} There are no monsters of that level yet. Try a different level.`);
		const monster = f.arrRandom(monsters); //Select a monster of that level at random to fight.
		const numMonsters = Math.floor(Math.random()*(1 + monster.maxNumber - monster.minNumber)) + monster.minNumber;

		let characters = [];
		for (let ct of ply.cultists){
			if (ct.job == 'Warrior'){
				characters.push(ct);
			}
		}

		if (characters.length == 0) return message.channel.send(`${us} You do not have any warriors. Assign some in the /cult`);

		challengedRecently.add(message.author.id); //Make sure they can't spam the command.

		for (let war of characters){ //Determine front or backline
			let secondPass = false; //If they have any melee weapon, they're on the front line
			for (let wep of war.equipment.weapons){
				let base;
				for (let bs of weaponTbl.bases){
					if (bs.id == wep.base) base = bs;
				}

				if (!base) base = {type:'none'}
				
				if (base.type != 'Ranged' && base.type != 'Thrown' && base.type != 'Magic' && base.type != 'none'){
					war.frontline = true;
				} else if (!war.frontline && secondPass) war.backline = true
				secondPass = true;
			}
		}

		//Add monsters to character array
		for (let i = 0; i< numMonsters;i++){
			let mon = {...monster};
			characters.push(mon);
		}

		function cultistInitiative(cultist, initMod){
			let d20 = Math.ceil(Math.random()*20);
			let initiative = cultist.stats.dex + initMod + d20;
			if (initiative < 1) initiative = 1;
			return initiative;
		}
		function monsterInitiative(monster){
			let d20 = Math.ceil(Math.random()*20);
			let initiative = monster.speed + d20;
			return initiative;
		}

		//Determine Initiative
		for (let char of characters){
			if (char.equipment){
				char.hp *= 2;
				char.conditions = [];
				let arm = char.equipment.armour;
				char.armArr = [];
				char.armArr.push(arm.head);
				char.armArr.push(arm.body);
				char.armArr.push(arm.hands);
				char.armArr.push(arm.legs);
				char.armArr.push(arm.feet);
				let initMod = 0;
				for (let arm of char.armArr){
					if (arm.type == 'heavy') initMod--;
					if (arm.type == 'light') initMod++;
				}
				
				char.initiative = cultistInitiative(char, initMod);
			}
			else{
				char.initiative = monsterInitiative(char)
			}
		}
		characters.sort(function(a,b){return b.initiative - a.initiative})
		let initTbl = [];
		let initiativeTable = [];
		let x = 1;
		for (let char of characters){
			if (char.speed && numMonsters != 1){
				char.name += ` ${x}`; //Identify each monster.
				x++;
			} else if (char.speed){
				char.name = `the ${char.name}`; //if it's the only monster, their name has 'the' at the start for grammar purposes.
			}
			let details = {
				name: char.name,
				hp: char.hp,
				maxhp: char.hp
			}
			if (char.id) details.id = char.id;
			initTbl.push(details);
			if (!char.turns) char.turns = 1;
			for (let i=0;i<char.turns;i++){
				initiativeTable.push(char);
			}
		}

		function calcDefence(cultist){
			let def = 0;
			for (let arm of cultist.armArr){
				if (!arm.defence) arm.defence = 0;
				def += arm.defence;
			}
			return def;
		}

		function calcDamage(dmg, def){
			if (def <= 0) def = 1;
			let newdmg = (f.randn_bm()+1)*dmg
			if (newdmg > 2*dmg) newdmg = 2*dmg;
			if (newdmg < dmg/2) newdmg = dmg/2;
			let newdef = def/10
			newdmg = newdmg -= newdef;
			newdmg = Math.ceil(newdmg / 10);
			if (newdmg < 0) newdmg = 0;
			return newdmg;
		}

		function triggerConditions(tgt){
			let x = 0;
			let effInfo = {}
			let finaltext = '';
			effInfo.shouldEnd = false;
			for (let cond of tgt.conditions){
				let hpchange = tgt.hp;
				cond.trigger(tgt);
				hpchange = hpchange - tgt.hp;
				let text = f.arrRandom(cond.text);
				text = text.replace('DMG', hpchange);
				text = text.replace('CULTIST', tgt.name);
				cond.timer++;
				if (cond.endCondition(tgt)){
					tgt.conditions.splice(x,1);
					text += (`\n▫️ The ${cond.name} on ${tgt.name} wears off.`)
				}
				text = `${cond.emote} ${text}`;
				if (finaltext != '') finaltext += '\n';
				finaltext += text;
				if (cond.shouldEnd) effInfo.shouldEnd = true;
				x++;
			}
			effInfo.text = finaltext;
			return effInfo;
		}

		const heart =  '❤️';
        const monstEmote = '💢';
        const cultEmote = '🗡️';

		function monsterAttack(monster){
			let usedAttacks = 0;
			let attack;
			let rand = Math.random();
			for (let at of monster.attacks){ //Randomise which attack is used.
				usedAttacks += at.chance;
				if (rand <= usedAttacks && !attack) attack = at;
			}
			let frontline = [];
			let backline = [];
			for (let char of initiativeTable){
				if (char.frontline) frontline.push(char);
				else if (char.equipment) backline.push(char);
			}
			let target;
			let fullDmgInfo = [];
			if (!attack.targets) attack.targets = 1;

			let avDmg = 0;
			let targetsHit = 0;

			for (let i=0;i<attack.targets;i++){
				if (frontline.length != 0 || backline.length != 0){
					if (frontline.length != 0){
						target = f.arrRandom(frontline); //Prioritise characters on the frontline.
						f.removeA(frontline, target);
					}
					else{
						target = f.arrRandom(backline);
						f.removeA(backline, target);
					}
					
					let dmgInfo = {};

					let dmg = calcDamage(attack.damage, calcDefence(target));
					dmgInfo.damage = dmg;
					avDmg += dmg;
					targetsHit++;

					dmgInfo.effects = [];
					if (attack.effects){
						for (let ef of attack.effects){
							if ((ef.onHit && dmgInfo.damage != 0) || !ef.onHit){
								let r = Math.random();
								let ch = Math.floor(Math.pow(f.getStatFromString(ef.stat,target),0.5));
								if (r < ef.chance/ch){
									for (let cond of conditions){
										if (cond.name == ef.effect){
											cond = {...cond};
											cond.potency = ef.potency;
											cond.duration = ef.duration;
											dmgInfo.effects.push(cond);
										}
									}
								}
							}
						}
					}
					dmgInfo.target = target;
					fullDmgInfo.push(dmgInfo);
				}
			}
			avDmg = Math.floor(avDmg/targetsHit);
			if (!monster.emote) monster.emote = monstEmote;
			let text = '';
			if (avDmg == 0){
				text += f.arrRandom(attack.miss);
			}
			else{
				text +=f.arrRandom(attack.hit);
			}
			if (targetsHit > 1){
				text = text.replace('CULTIST', 'the party');
				if (avDmg != 0){
					text += ` an average of`;
				}
			}
			else{
				text = text.replace('CULTIST', fullDmgInfo[0].target.name);
			}
			if (avDmg != 0) text += ` ${avDmg} ${attack.type} damage.`;
			text = text.replace('ENEMY', monster.name);
			text = `${monster.emote} `+f.capitalise(text);
			for (let dmgInfo of fullDmgInfo){
				for (let ef of dmgInfo.effects){
					let has = false;
					for (let cond of dmgInfo.target.conditions){
						if (cond.name == ef.name){
							has = true;
							cond.duration += ef.duration;
						}
					}
					if (!has){
						text += `\n▫️ ${dmgInfo.target.name} is afflicted with ${ef.name}`
						dmgInfo.target.conditions.push(ef)
					} else text += `\n▫️ The ${ef.name} on ${dmgInfo.target.name} is extended.`;
				}
			}
			return {fullDmgInfo, text};
		}

		function cultistAttack(cultist, wep){
			let x = 0
			let dmgInfo = {}; // Store info on the attack to use later.
			let text = '';

			let target = {};
			while (!target.speed) target = f.arrRandom(initiativeTable);

			let ab = f.calcAttackStat(cultist,wep); //Attack Bonus
			let base;
			let prefix;
			let suffix;
			for (let bs of weaponTbl.bases){
				if (bs.id == wep.base) base = bs;
			}
			for (let suf of weaponTbl.suffixes){
				if (suf.id == wep.suffix) suffix = suf;
			}
			for (let pref of weaponTbl.prefixes){
				if (pref.id == wep.prefix) prefix = pref;
			}
			let dmg = calcDamage(ab+wep.damage,target.defence);
			if (!base.hitText && dmg < Math.floor((ab+wep.damage)/10)) dmg = Math.floor((ab+wep.damage)/10);
			for (let res of monster.resistances){
				if (res == wep.dmgType) dmg = Math.floor(dmg/resistanceReduction);
			}
			for (let weak of monster.weaknesses){
				if (weak == wep.dmgType) dmg = dmg*Math.ceil(weaknessIncrease);
			}
			if (base.hitText){
				if (dmg == 0) text += f.arrRandom(base.missText);
				else {
					text += f.arrRandom(base.hitText);
					text += ` ${dmg} ${wep.dmgType} damage.`;
				}
			} else { //Spells always deal at least some damage.
				text += f.arrRandom(suffix.hitText);
				text += ` ${dmg} ${wep.dmgType} damage.`;
			}

			text = text.replace('CULTIST', cultist.name);
			text = text.replace('ENEMY', target.name);
			text = text.replace('ITEM', base.name.toLowerCase());
			text = `${cultEmote} ` + f.capitalise(text);
			dmgInfo.text = text;
			dmgInfo.damage = dmg;
			dmgInfo.target = target;
			return dmgInfo;
		}
		let totalMonsterHealth = 0;
		let totalCultistHealth = 0;

		for (let char of characters){
			if (char.speed) totalMonsterHealth += char.hp;
			if (char.equipment) totalCultistHealth += char.hp;//Total monster + character hp.
		}

		let emb = new Discord.MessageEmbed()
		.setTitle('Creating combat log...');
		let combatLog = await message.channel.send(emb);
		let log = [];

		async function createItemReward(rew, item){
			let id = (await DB.query(`SELECT nextitemid FROM idlegame`)).rows[0].nextitemid;
			DB.query(`UPDATE idlegame SET nextitemid = ${Number(id)+1}`);

			const prefixChance = 0.35;
			const suffixChance = 0.1;
			let rdmBases = [...item.bases];
			rdmBases = f.arrRandomise(rdmBases);

			for (let base of rdmBases){ //Go through the bases in a random order.
				let feasibleBase = false;

				if (rew.bases){ //If base is specified.
					for (let b of rew.bases){
						if (b == base.name){
							feasibleBase = true;
						}
						else if (base.names){
							if (base.names.includes(b)) feasibleBase = true;
						}
					}
				} else if (base.id > 0){
					feasibleBase = true; //Otherwise use any base with id > 0.
				}

				if (feasibleBase){
					let material;
					let hasMaterial = false;
					if (rew.materials){//If material is specified, create that.
						let baseMaterials;
						if (base.material == 'metal') baseMaterials = item.materials.metals;
						if (base.material == 'leather') baseMaterials = item.materials.leathers;
						if (base.material == 'magic') baseMaterials = item.materials.magic;
						if (base.material == 'wood') baseMaterials = item.materials.woods;
						let matTbl = [];
						for (let pos of baseMaterials){ //These are the possible materials for the base we chose earlier.
							if (rew.materials.includes(pos.name)){
								hasMaterial = true; //We now know there's a feasible material.
								for (let i=0;i<pos.abundance;i++){ //Add weights
									matTbl.push(pos);
								}	
							}
						}
						material = f.arrRandom(matTbl); //Randomise with weights.
					} else{ //If material not specified, generate a random material.
						material = item.randomiseMaterial(base);
						hasMaterial = true;
					}

					let prefix;
					let hasPrefix = false;
					if (rew.prefixes){ //If prefix is specified, make sure it has it.
						let prefTbl = [];
						for (let pref of item.prefixes){
							if (rew.prefixes.includes(pref.name)){
								hasPrefix = true
								for (let i=0;i<pref.abundance;i++){//Add weights
									prefTbl.push(pref);
								}
							}
						}
						prefix = f.arrRandom(prefTbl);//Randomise with weights
					} else{
						if (prefixChance > Math.random()){
							prefix = item.randomisePrefix(base);
						}
						hasPrefix = true;
					}

					let suffix;
					let hasSuffix = false
					if (rew.suffixes){ //If prefix is specified, make sure it has it.
						let suffTbl = [];
						for (let suff of item.suffixes){
							if (rew.suffixes.includes(suff.name)){
								hasSuffix = true
								for (let i=0;i<suff.abundance;i++){//Add weights
									suffTbl.push(suff);
								}
							}
						}
						suffix = f.arrRandom(suffTbl);//Randomise with weights
					} else{
						if (suffixChance > Math.random()){
							suffix = item.randomiseSuffix(base);
						}
						hasSuffix = true;
					}

					if (hasSuffix && hasPrefix && hasMaterial){
						let itm = await item.generateItem(id,base,material,prefix,suffix);
						if (rew.modify){ //Do final modifications to allow drops unique to monsters.
							for (let mod of rew.modify){
								if (mod.chance > Math.random() && itm.name.search(mod.baseName) != -1){
									if (mod.newName) itm.name = itm.name.replace(mod.baseName,mod.newName);
									if (mod.defenceModifier && itm.defence) itm.defence = Math.ceil(itm.defence*mod.defenceModifier);
									if (mod.attackModifier && itm.attack) itm.attack = Math.ceil(mod.attackModifier*itm.attack);
									if (mod.valueModifier) itm.value = Math.ceil(itm.value*mod.valueModifier);
								}
							}
						}
						return itm;
					}
				}
			}
			console.log('ERROR There are no possible items with that combination.')
			return null;
		}

		async function giveRewards(monster){
			ply = await f.getCult(message.author);
			ply.money = Number(ply.money);
			ply.items = JSON.parse(ply.items);
			let rewMessage = `${us} Your cultists defeat the monsters.\n__**Rewards**__\n`;
			for (let rew of monster.drops){
				if (rew.chance > Math.random()){
					if (rew.name == 'Money'){
						let money = Math.floor(Math.random()*(rew.maxNumber - rew.minNumber)) + rew.minNumber;
						ply.money += money;
						rewMessage += `> £${f.numberWithCommas(money)}\n`
					}
					if (rew.name == 'Armour'){
						let num = 1;
						if (rew.minNumber && rew.maxNumber){
							let diff = rew.maxNumber - rew.minNumber;
							num = Math.floor(Math.random()*diff) + rew.minNumber;
						}
						for (let i=0;i<num;i++){
							if (i==0 || rew.chance > Math.random()){ //Run the chance each time.
								let arm = await createItemReward(rew,armourTbl);
								ply.items.armour.push(arm);
								rewMessage += `> ${arm.name}\n`;
							}
						}
					}
					if (rew.name == 'Weapon'){
						let num = 1;
						if (rew.minNumber && rew.maxNumber){
							let diff = rew.maxNumber - rew.minNumber;
							num = Math.floor(Math.random()*diff)+rew.minNumber;
						}
						for (let i=0;i<num;i++){
							if (i==0 || rew.chance > Math.random()){ //Run the chance each time.
								let wep = await createItemReward(rew,weaponTbl);
								if (wep){
									ply.items.weapons.push(wep);
									rewMessage += `> ${wep.name}\n`;
								}
							}
						}
					}
				}
			}
			let query = `
				UPDATE cults
				SET money = ${ply.money},
				items = '${JSON.stringify(ply.items)}'
				where owner_id = ${ply.owner_id}
			`;
			DB.query(query);
			message.channel.send(rewMessage);
		}

		const skull = '☠️';
		function generateHealthBar(char){
			let hpStr = '';
			let colourArr = [];
			colourArr.push('🖤');//Black
			colourArr.push('❤️');//Red
			colourArr.push('🧡');//Orange
			colourArr.push('💛');//Yellow
			colourArr.push('💚');//Green
			colourArr.push('💙');//Blue
			colourArr.push('💜');//Purple
			colourArr.push('🤍');//White

			if (char.hp <= 0){
				return skull;
			} else {
				let colourNum = Math.ceil(char.hp/50);
				for (let i = 50*(colourNum-1); i < 50*colourNum; i++){
					if (Math.floor(i/25) == i/25 && Math.floor(i/2) != i/2) hpStr += '\n';
					if (i<char.hp) hpStr += colourArr[colourNum];
					else if ((i >= char.hp && char.maxhp > 50)|| (i < char.maxhp && i >= char.hp && char.hp < char.maxhp && char.maxhp <= 50)) hpStr += colourArr[colourNum-1];
					// ^ If they have over 50hp, fill hp bar with previous colour hearts|| ^ If they have less than 50hp, only use previous colour hearts for missing hp.
				}
			}

			return hpStr;
		}	

		function generateAttackEmbed(){
			let initStr = '';
			for (let char of initTbl){
				let hpStr = generateHealthBar(char);
				let name = char.name;
				if (name.startsWith('the ')){ //Remove 'the' from monsters in the initiative list.
					name = monster.name;
				}
				let nameParts = name.split(' ');
				name = '';
				for (let part of nameParts)	name += f.capitalise(part) + ' '; //Capitalise all words of the name.
				initStr += `**${f.capitalise(name)}**\n${hpStr}\n`;
			}
			let logStr = '';
			for (let l of log) logStr += `${l}\n`;

			let emb = new Discord.MessageEmbed()
			.setTitle(`${monster.name.charAt(0).toUpperCase() + monster.name.slice(1)} Encounter`)		
			.setDescription(logStr)
			.addFields([
				{
					"name": "__Initiative Order__",
					"value": initStr

				}
			]);
			return emb;
		}

		async function doAttack(init){
			let attacker = initiativeTable[init];
			let dmgInfo;
			const logsize = 4;
			
			if (attacker.speed){ //if the attacker is a monster.
				let x = monsterAttack(attacker);
				let fullDmgInfo = x.fullDmgInfo;
				let text = x.text;
				let dead = [];
				
				for (let dmgInfo of fullDmgInfo){ //Go through all targets of the attack.
					if (dmgInfo.target.hp <= dmgInfo.damage){ //if the attack does more damage than the target has hp
						dmgInfo.damage = dmgInfo.target.hp;
						f.removeA(initiativeTable, dmgInfo.target);//Remove the dead character from possible targets.
						dead.push(`\n${skull} ${dmgInfo.target.name} dies.`)
					}
					dmgInfo.target.hp -= dmgInfo.damage;
					totalCultistHealth -= dmgInfo.damage;
					for (let char of initTbl){
						if (char.name == dmgInfo.target.name && char.id == dmgInfo.target.id) char.hp = dmgInfo.target.hp;
					}
				}
				for (let deadtext of dead){
					text += deadtext;
				}
				text = f.capitalise(text);
				log.push(text);
				if (log.length > logsize) log.splice(0,1); //Keep only the last few statements in the log.
			}
			else { //If the attacker is a cultist.
				let effInfo = triggerConditions(attacker); //Trigger conditions first.
				if (effInfo.text != '') log.push(effInfo.text);
				for (let char of initTbl){
					if (char.name == attacker.name && char.id == attacker.id) char.hp = attacker.hp;
				}
				if (attacker.hp <= 0){
					let emb = generateAttackEmbed();
					combatLog.edit(emb);
					f.removeA(initiativeTable, attacker);
					init++
					if (init >= initiativeTable.length) init = 0;
					return setTimeout(doAttack,4000,init);
				}
				if (log.length > logsize) log.splice(0,1);
				if (effInfo.shouldEnd){
					let emb = generateAttackEmbed();
					combatLog.edit(emb);
					init++;
					if (init >= initiativeTable.length) init = 0;
					return setTimeout(doAttack,4000, init);
				}
				let emptyhands = 0;
				let shouldAttack;
				for (let wep of attacker.equipment.weapons){
					shouldAttack = false;
					if (wep.name != 'none' && wep.base){ //If it's a valid weapon, make an attack with it.
						shouldAttack = true;
					} else{
						emptyhands++;
						if (emptyhands == 2){ //If both hands are empty, cultist attacks with their fists.
							wep = {
								damage: 1,
								base: 0,
								stat: ['str'],
								dmgType: 'bludgeoning'
							}
							shouldAttack = true;
						}
					}
					let x = 0;
					for (let int of initiativeTable){
						if (int.speed) x++;
					}
					if (x == 0) shouldAttack = false; //Make sure if there are no monsters we don't attack.
					if (shouldAttack){
						dmgInfo = cultistAttack(attacker, wep);
						log.push(dmgInfo.text);
						if (dmgInfo.target.hp <= dmgInfo.damage){
							dmgInfo.damage = dmgInfo.target.hp;
							f.removeA(initiativeTable, dmgInfo.target);
							let dt = dmgInfo.target.name;
							log.push(`${skull} ${f.capitalise(dt)} dies.`)
						}
						dmgInfo.target.hp -= dmgInfo.damage;
						totalMonsterHealth -= dmgInfo.damage;
						for (let char of initTbl){
							if (char.name == dmgInfo.target.name) char.hp = dmgInfo.target.hp;
						}
						if (log.length > logsize) log.splice(0,1);
					}
				}
			}
			let emb = generateAttackEmbed();
			combatLog.edit(emb);

			if (totalMonsterHealth > 0 && totalCultistHealth > 0){ //If both sides are alive, keep going.
				init++; 
				if (init >= initiativeTable.length) init = 0;
				setTimeout(doAttack,4000, init)
			} else { //Otherwise stop.
				challengedRecently.delete(message.author.id);
				if (totalMonsterHealth <= 0){//if it's the monsters that have died, the cultists win
					giveRewards(monster);
				}
				else message.channel.send(`${us} Monsters win.`) //Otherwise monsters win.
			}
		}
		let init = 0;	
		doAttack(init);
	}
	async exec(message, args) {
	}
}

module.exports = ChallengeCommand;