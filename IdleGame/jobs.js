const f2 = require('../commands/IdleGame/functions.js');
const f = require('../functions.js');
const fs = require('fs');
const armour = require('./armour.js');
const weapons = require('./weapons.js');

let lastTrigger = Date.now();
let lastSacrifice = Date.now();
setInterval(TriggerJobs, 10000); //Loop every 10 seconds so we can get the cultists to automate stuff.

function TriggerJobs(){
	let players = JSON.parse(fs.readFileSync('IdleGame/stats.json'));

	for (let ply of players){
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
				if (difference >= 60000){
					let stat = str;
					if (dex > stat){
						stat = dex; //Create sacrifices based on strength or dex stat.
					}
					stat = Math.ceil(Math.pow(stat, 2) / 5);
					ply.sacrifices += stat;
					if (ply.sacrifices > ply.sacrificeMax){
						ply.sacrifices = ply.sacrificeMax;
					}
					cult.lastAction = Date.now();
				}
			}
			if (cult.job == 'Researcher'){ 
				for (let tr of cult.traits){
					if (tr.name == "Academic") difference *= 1.2;
					if (tr.name == "Disorganised") difference *= 0.8;
				}
				if (difference >= 180000 / wis){ //Research speed is based on wis
					ply.research += Math.ceil(Math.pow(int, 2) / 5); //Research amount is based on int
					cult.lastAction = Date.now();
				}
			}
			if (cult.job == 'Explorer' && Math.random()*20+cha >= 20 && difference >= 180000 / wis){ //Luck based on charisma, speed based on wisdom
				let item;
				let item2;
				item = weapons.generateRandomItem();
				item2 = armour.generateRandomItem();
				if (item2.value < item) item = item2; //Generate 2 items and take the lowest value of the two.

				ply.items.weapons.push(item);
			}
		}
	}
	if (players.length !=0){
		lastTrigger = Date.now();
		fs.writeFileSync('IdleGame/stats.json', JSON.stringify(players, null, 2));
	}
}
