const fs = require('fs');
const jsonString = fs.readFileSync('IdleGame/stats.json');
const players = JSON.parse(jsonString);

function findPly(ply){
	for (pl of players){
		if (ply.user.toString() == pl.name){
			return pl
		}
	}
}

function pushRenewableUpgrade(id,pl){
	let upgr = {
		id: id,
		number: 1
	}

	for (let i of pl.upgrades.renewable){
		if (i.id == id){
			return upgr.number++;
		}
	}

	pl.upgrades.renewable.push(upgr);
	return 1;
}

module.exports = {
	oneTime: [
		{
			name: "Quality Corpses",
			id: 1,
			description: "+30% money from offerings",
			cost: 3000,
			requirements: [],
			onBuy: function(ply){
				let pl = findPly(ply);
				pl.offerMultiplier += 0.3;
				pl.upgrades.oneTime.push(this.id);
				fs.writeFileSync('IdleGame/stats.json', JSON.stringify(players, null, 2));			
			}
		},
		{
			name: "More Corpses",
			id: 2,
			description: "+1 sacrifice from sacrifices",
			cost: 10000,
			requirements: [],
			onBuy: function(ply){
				let pl = findPly(ply);
				pl.sacrificeMultiplier ++;
				pl.upgrades.oneTime.push(this.id);
				fs.writeFileSync('IdleGame/stats.json', JSON.stringify(players,null,2));
			}
		}
	],
	repeatable: [
		{
			name: "Shed",
			id: 1,
			description: "+10 sacrifice capacity",
			cost: 1000,
			requirements: [],
			onBuy: function(ply){
				let pl = findPly(ply);
				pl.sacrificeMax += 10;
				pushRenewableUpgrade(this.id,pl);
				fs.writeFileSync('IdleGame/stats.json', JSON.stringify(players, null, 2));
			}
		}
	]
}