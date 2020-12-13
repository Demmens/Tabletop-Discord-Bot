const f = require('../functions.js');
const armour = require('./armour.js');
const weapons = require('./weapons.js');

let lastTrigger = Date.now();
let lastSacrifice = Date.now();
setInterval(TriggerJobs, 10000); //Loop every 10 seconds so we can get the cultists to automate stuff.

async function TriggerJobs(){
	try {
		let key = require('../token.json').key;
	} catch(err){
		let players = await f.getCults();
		let idlegame = (await f.runQuery(`SELECT * FROM idlegame`)).rows[0];
		for (let ply of players){
			ply.cultists = JSON.parse(ply.cultists);
			ply.items = JSON.parse(ply.items);
			ply.upgrades = JSON.parse(ply.upgrades);
			ply.money = Number(ply.money);
			ply.sacrifices = Number(ply.sacrifices);
			ply.sacrificemax = Number(ply.sacrificemax);
			ply.research = Number(ply.research);
			ply.rewards = JSON.parse(ply.rewards);
			for (let cult of ply.cultists){ 

				let difference = Date.now() - cult.lastAction;
				let wis = cult.stats.wis;
				let con = cult.stats.con;
				let dex = cult.stats.dex;
				let str = cult.stats.str;
				let cha = cult.stats.cha;
				let int = cult.stats.wis;

				if (cult.job == 'Sacrificer'){ //Create sacrifices every 10 mins
					for (let tr of cult.traits){
						if (tr.name == "Bloodthirsty") difference *= 1.2;
						if (tr.name == "Haemophobic") difference *= 0.8;
					}
					if (difference*(Math.pow(dex,0.5)) >= 60000){ //Speed based on dex, amount based on strength.
						str = Math.ceil(Math.pow(str, 2) / 5);
						ply.sacrifices += str;
						if (ply.sacrifices > ply.sacrificemax){
							ply.sacrifices = ply.sacrificemax;
						}
						cult.lastAction = Date.now();
					}
				}
				if (cult.job == 'Researcher'){ 
					for (let tr of cult.traits){
						if (tr.name == "Academic") difference *= 1.2;
						if (tr.name == "Disorganised") difference *= 0.8;
					}
					if (difference*Math.pow(wis,0.5) >= 180000){ //Research speed is based on wis
						ply.research += Math.ceil(Math.pow(int, 2) / 5); //Research amount is based on int
						cult.lastAction = Date.now();
					}
				}
				if (cult.job == 'Explorer'){ //Luck based on charisma, speed based on wisdom
					if  ((Math.random()*20)+cha >= 20 && difference*(Math.pow(wis,0.5)) >= 7200000 ){ //every 2 hours, 5% chance to generate an item (if wis/cha are 1.)
						let item;
						let item2;
						let id = Number(idlegame.nextitemid);
						item = weapons.generateRandomItem(id);
						item2 = armour.generateRandomArmour(id);
						if (item2.value < item.value) item = item2; //Generate 2 items and take the lowest value of the two.

						ply.rewards.push(item);
						cult.lastAction = Date.now();
						f.runQuery(`UPDATE idlegame SET nextitemid = ${id+1}`)
					}
				}
			}
			ply.items = JSON.stringify(ply.items);
			ply.rewards = JSON.stringify(ply.rewards);
			ply.upgrades = JSON.stringify(ply.upgrades);
			ply.cultists = JSON.stringify(ply.cultists);
			f.fullWriteCults(ply);
		}
	}
}
