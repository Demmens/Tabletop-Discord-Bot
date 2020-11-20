const fs = require('fs');

function findPly(ply,players){
	if (!players){
		players = retrieveStats();
	}
	for (pl of players){
		if (ply.user.toString() == pl.name){
			return pl;
		}
	}
}

function retrieveStats(){
	const players = JSON.parse(fs.readFileSync('IdleGame/stats.json'));
	return players;
}

function writeStats(players){
	fs.writeFileSync('IdleGame/stats.json', JSON.stringify(players, null, 2));
}

function pushRepeatableUpgrade(id,pl){
	let upgr = {
		id: id,
		number: 1
	}

	for (let i of pl.upgrades.repeatable){
		if (i.id == id){
			i.number++;
			return i.number;
		}
	}

	pl.upgrades.repeatable.push(upgr);
	return 1;
}

function hasUpgrade(id, ply){
	const players = retrieveStats();
	let pl = findPly(ply,players);
	for (let i of pl.upgrades.oneTime){
		if (i == id){
			return true;
		}
	}
	return false;
}

function hasRepeatableUpgrade(id,ply){
	const players = retrieveStats();
	let pl = findPly(ply,players);
	for (let i of pl.upgrades.repeatable){
		if (i.id == id){
			return i.number;
		}
	}
	return 0;
}

function hasResearch(num, ply){
	const players = retrieveStats();
	let pl = findPly(ply,players);
	if (pl.research >= num) return true;
	return false;
}

module.exports = {
	oneTime: [
		{
			name: "Quality Corpses",
			id: 1,
			description: "+30% money from offerings",
			cost: 3000,
			requirements: function(ply){
				return true;
			},
			onBuy: function(ply){
				const players = retrieveStats();
				let pl = findPly(ply,players);
				pl.offerMultiplier += 0.3;
				pl.upgrades.oneTime.push(this.id);
				writeStats(players);		
			}
		},
		{
			name: "More Corpses",
			id: 2,
			description: "+1 sacrifice from sacrifices",
			cost: 10000,
			requirements: function(ply){
				return true;
			},
			onBuy: function(ply){
				const players = retrieveStats();
				let pl = findPly(ply,players);
				pl.sacrificeMultiplier ++;
				pl.upgrades.oneTime.push(this.id);
				writeStats(players)
			}
		},
		{
			name: "Higher Quality Corpses",
			id:3,
			description: "+50% money from offerings",
			cost:7000,
			requirements: function(ply){
				if (hasUpgrade(1,ply)) return true;
				return false;
			},
			onBuy: function(ply){
				const players = retrieveStats()
				let pl = findPly(ply,players);
				pl.offerMultiplier += 0.5;
				pl.upgrades.oneTime.push(this.id);
				writeStats(players);
			}
		},
		{
			name: "Even more Corpses",
			id: 4,
			description: "+2 sacrifices from sacrifices",
			cost: 50000,
			requirements: function(ply){
				if (hasUpgrade(2,ply) && hasResearch(100,ply)){
					return true;
				}
				return false;
			},
			onBuy: function(ply){
				const players = retrieveStats()
				let pl = findPly(ply,players);
				pl.sacrificeMultiplier += 2;
				pl.upgrades.oneTime.push(this.id);
				writeStats(players);
			}
		},
		{
			name: "Rituals",
			id: 5,
			description: "Earn 100% more money from daily bonuses",
			cost: 5000,
			requirements: function(ply){
				return true
			},
			onBuy: function(ply){
				const players = retrieveStats();
				let pl = findPly(ply,players);
				pl.dailyMultiplier += 1;
				pl.upgrades.oneTime.push(this.id);
				writeStats(players);
			}
		},
		{
			name: "Corpse reservoirs",
			id: 6,
			description: "+6 sacrifices from sacrifices",
			cost: 750000,
			requirements: function(ply){
				if (hasUpgrade(4,ply) && hasResearch(1000, ply)) return true;
				return false;
			},
			onBuy: function(ply){
				const players = retrieveStats()
				let pl = findPly(ply,players);
				pl.sacrificeMultiplier += 6;
				pl.upgrades.oneTime.push(this.id);
				writeStats(players);
			}
		},
		{
			name: "Sermons",
			id: 7,
			description: "Earn 400% more money from daily bonuses",
			cost: 50000,
			requirements: function(ply){
				if (hasUpgrade(5,ply)){
					let pl = findPly(ply);
					if (pl.cultists.length > 4) return true;
					return false;
				}
				return false;
			},
			onBuy: function(ply){
				const players = retrieveStats();
				let pl = findPly(ply,players);
				pl.dailyMultiplier += 4;
				pl.upgrades.oneTime.push(this.id);
				writeStats(players);
			}
		},
		{
			name: "Ceremonies",
			id: 8,
			description: "Earn 1000% more money from daily bonuses",
			cost: 300000,
			requirements: function(ply){
				if (hasUpgrade(7,ply)){
					let pl = findPly(ply);
					if (pl.cultists.length > 9) return true
				}
				return false;
			},
			onBuy: function(ply){
				const players = retrieveStats();
				let pl = findPly(ply,players);
				pl.dailyMultiplier += 10;
				pl.upgrades.oneTime.push(this.id);
				writeStats(players);
			}
		},
		{
			name: "Sharper Daggers",
			id: 9,
			description: "Cultists create 20% more sacrifices",
			cost: 20000,
			requirements: function(ply){
				let pl = findPly(ply);
				if (pl.cultists.length != 0) return true;
				return false;
			},
			onBuy: function(ply){
				const players = retrieveStats();
				let pl = findPly(ply, players);
				pl.cultSacMult += 0.2;
				pl.upgrades.oneTime.push(this.id);
				writeStats(players);
			}
		}
	],
	repeatable: [
		{
			name: "Shed",
			id: 1,
			description: "+5 sacrifice capacity",
			cost: 1000,
			requirements: function(ply){
				return true;
			},
			onBuy: function(ply){
				const players = retrieveStats();
				let pl = findPly(ply,players);
				let num = pushRepeatableUpgrade(this.id,pl);
		
				pl.sacrificeMax += 5;
				
				writeStats(players);
			}
		},
		{
			name: "Basement",
			id: 2,
			description: "+20 sacrifice capacity",
			cost: 10000,
			requirements: function(ply){
				if (hasRepeatableUpgrade(1,ply) >= 5){
					return true;
				}
				return false;
			},
			onBuy: function(ply){
				const players = retrieveStats();
				let pl = findPly(ply,players);
				let num = pushRepeatableUpgrade(this.id,pl);
		
				pl.sacrificeMax += 20;
			
				let JSONstr = JSON.stringify(players,null,2);
				writeStats(players);
			}
		},
		{
			name: "Warehouse",
			id: 3,
			description: "+100 sacrifice capacity",
			cost: 200000,
			requirements: function(ply){
				if (hasRepeatableUpgrade(2,ply) >= 5){
					return true;
				}
				return false;
			},
			onBuy: function(ply){
				const players = retrieveStats();
				let pl = findPly(ply,players);
				let num = pushRepeatableUpgrade(this.id,pl);
		
				pl.sacrificeMax += 100;
			
				let JSONstr = JSON.stringify(players,null,2);
				writeStats(players);
			}
		},
		{
			name: "Bunker",
			id: 4,
			description: "+1000 sacrifice capacity",
			cost: 5000000,
			requirements: function(ply){
				if (hasRepeatableUpgrade(3,ply) >= 10){
					return true;
				}
				return false;
			},
			onBuy: function(ply){
				const players = retrieveStats();
				let pl = findPly(ply,players);
				pushRepeatableUpgrade(this.id,pl);
		
				pl.sacrificeMax += 1000;
			
				writeStats(players);
			}
		},
		{
			name: "Cult leader",
			id: 5,
			description: "Increase cultist capacity by 3",
			cost: 12500,
			requirements: function(ply){
				const players = retrieveStats();
				let pl = findPly(ply, players);
				if (pl.cultists.length > 1 && (hasRepeatableUpgrade(6,ply)*2) +2 > hasRepeatableUpgrade(5,ply)){
					return true;
				}
				return false;
			},
			onBuy: function(ply){
				const players = retrieveStats();
				let pl = findPly(ply,players);
				pushRepeatableUpgrade(this.id,pl);
				pl.maxCultists += 3;

				writeStats(players);
			}
		},
		{
			name: "Great Prophet",
			id: 6,
			description: "Increase Cult Leader capacity by 2",
			cost: 2500000,
			requirements: function(ply){
				if (hasRepeatableUpgrade(5,ply) >= 2){
					return true;
				}
				return false;
			},
			onBuy: function(ply){
				pushRepeatableUpgrade(this.id,pl);
			} //Doesn't actually need to do anything, since the effect is in the cult leader requirements
		},
		{
			name: "Additional Altar",
			id: 7,
			description: "Allows assinging an extra sacrificer",
			cost: 10000,
			requirements: function(ply){
				let pl = findPly(ply);
				if (pl.cultists.length != 0) return true;
				return false;
			},
			onBuy: function(ply){
				const players = retrieveStats();
				let pl = findPly(ply, players);
				pl.maxSacrificers += 1;
				pushRepeatableUpgrade(this.id,pl);
				writeStats(players);
			}
		},
		{
			name: "Additional Library",
			id: 8,
			description: "Allows assinging an extra researcher",
			cost: 10000,
			requirements: function(ply){
				let pl = findPly(ply);
				if (pl.cultists.length != 0) return true;
				return false;
			},
			onBuy: function(ply){
				const players = retrieveStats();
				let pl = findPly(ply, players);
				pl.maxResearchers += 1;
				pushRepeatableUpgrade(this.id,pl);
				writeStats(players);
			}
		}
	]
}