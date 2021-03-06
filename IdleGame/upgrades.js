function pushRepeatableUpgrade(id,ply){
	let upgr = {
		id: id,
		number: 1
	}

	for (let i of ply.upgrades.repeatable){
		if (i.id == id){
			i.number++;
			return i.number;
		}
	}

	ply.upgrades.repeatable.push(upgr);
	return 1;
}

function hasUpgrade(id, ply){
	for (let i of ply.upgrades.oneTime){
		if (i == id){
			return true;
		}
	}
	return false;
}

function hasRepeatableUpgrade(id,ply){
	for (let i of ply.upgrades.repeatable){
		if (i.id == id){
			return i.number;
		}
	}
	return 0;
}

function hasResearch(num, ply){
	if (ply.research >= num) return true;
	return false;
}

module.exports = {
	oneTime: [
		{
			name: "Quality Corpses",
			id: 1,
			description: "+30% money from offerings",
			cost: 6000,
			requirements: function(ply){
				return true;
			},
			onBuy: function(ply){
				ply.offermultiplier = Number(ply.offermultiplier);
				ply.offermultiplier += 0.3;
				ply.upgrades.oneTime.push(this.id);		
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
				ply.sacrificemultiplier ++;
				ply.upgrades.oneTime.push(this.id);
			}
		},
		{
			name: "Higher Quality Corpses",
			id:3,
			description: "+50% money from offerings",
			cost:15000,
			requirements: function(ply){
				if (hasUpgrade(1,ply)) return true;
				return false;
			},
			onBuy: function(ply){
				ply.offermultiplier = Number(ply.offermultiplier);
				ply.offermultiplier += 0.5;
				ply.upgrades.oneTime.push(this.id);
			}
		},
		{
			name: "Even more Corpses",
			id: 4,
			description: "Increase sacrifice yield by 2",
			cost: 50000,
			requirements: function(ply){
				if (hasUpgrade(2,ply) && hasResearch(10,ply)){
					return true;
				}
				return false;
			},
			onBuy: function(ply){
				ply.sacrificemultiplier += 2;
				ply.upgrades.oneTime.push(this.id);
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
				ply.dailymultiplier += 1;
				ply.upgrades.oneTime.push(this.id);
			}
		},
		{
			name: "Corpse reservoirs",
			id: 6,
			description: "Increase sacrifice yield by 6",
			cost: 350000,
			requirements: function(ply){
				if (hasUpgrade(4,ply) && hasResearch(100, ply)) return true;
				return false;
			},
			onBuy: function(ply){
				ply.sacrificemultiplier += 6;
				ply.upgrades.oneTime.push(this.id);
			}
		},
		{
			name: "Sermons",
			id: 7,
			description: "Earn 400% more money from daily bonuses",
			cost: 750000,
			requirements: function(ply){
				if (hasUpgrade(5,ply)){
					if (JSON.parse(ply.cultists).length > 4) return true;
					return false;
				}
				return false;
			},
			onBuy: function(ply){
				ply.dailymultiplier += 4;
				ply.upgrades.oneTime.push(this.id);
			}
		},
		{
			name: "Ceremonies",
			id: 8,
			description: "Earn 1000% more money from daily bonuses",
			cost: 3000000,
			requirements: function(ply){
				if (hasUpgrade(7,ply)){
					if (JSON.parse(ply.cultists).length > 9) return true
				}
				return false;
			},
			onBuy: function(ply){
				ply.dailymultiplier += 10;
				ply.upgrades.oneTime.push(this.id);
			}
		},
		{
			name: "Sharper Daggers",
			id: 9,
			description: "Cultists create 20% more sacrifices",
			cost: 20000,
			requirements: function(ply){
				if (JSON.parse(ply.cultists).length != 0) return true;
				return false;
			},
			onBuy: function(ply){
				ply.cultsacmult = Number(ply.cultsacmult);
				ply.cultsacmult += 0.2;
				ply.upgrades.oneTime.push(this.id);
			}
		},
		{
			name: 'Better Technique',
			id:10,
			description: "Decrease sacrifice time by 10%",
			cost: 25000,
			requirements: function(ply){
				return true
			},
			onBuy: function(ply){
				ply.sacrificespeedmult = Number(ply.sacrificespeedmult);
				ply.sacrificespeedmult *= 0.9;
				ply.upgrades.oneTime.push(this.id);
			}
		},
		{
			name: 'In the Rhythm',
			id: 11,
			description: "Decrease sacrifice time by 20%",
			cost: 65000,
			requirements: function(ply){
				if (hasUpgrade(10,ply)) return true;
				return false;
			},
			onBuy: function(ply){
				ply.sacrificespeedmult = Number(ply.sacrificespeedmult);
				ply.sacrificespeedmult *= 0.8;
				ply.upgrades.oneTime.push(this.id);
			}
		},
		{
			name: 'Endless corpses',
			id: 12,
			description: "Increase sacrifice yield by 20",
			cost:1000000,
			requirements: function(ply){
				if (hasUpgrade(6,ply) && hasResearch(1000,ply)) return true;
				return false;
			},
			onBuy: function(ply){
				ply.sacrificemultiplier += 20;
				ply.upgrades.oneTime.push(this.id);
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
			onBuy: function(ply){;
				pushRepeatableUpgrade(this.id,ply);
				ply.sacrificemax = Number(ply.sacrificemax);
				ply.sacrificemax += 5;
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
				pushRepeatableUpgrade(this.id,ply);
				ply.sacrificemax = Number(ply.sacrificemax);
				ply.sacrificemax += 20;
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
				pushRepeatableUpgrade(this.id,ply);
				ply.sacrificemax = Number(ply.sacrificemax);
				ply.sacrificemax += 100;
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
				pushRepeatableUpgrade(this.id,ply);	
				ply.sacrificemax = Number(ply.sacrificemax);
				ply.sacrificemax += 1000;
			}
		},
		{
			name: "Cult leader",
			id: 5,
			description: "Increase cultist capacity by 3",
			cost: 125000,
			requirements: function(ply){
				if (JSON.parse(ply.cultists).length > 1 && (hasRepeatableUpgrade(6,ply)*2) +2 > hasRepeatableUpgrade(5,ply)){
					return true;
				}
				return false;
			},
			onBuy: function(ply){
				pushRepeatableUpgrade(this.id,ply);
				ply.maxcultists += 3;
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
				pushRepeatableUpgrade(this.id,ply);
			} //Doesn't actually need to do anything, since the effect is in the cult leader requirements
		},
		{
			name: "Additional Altar",
			id: 7,
			description: "Allows assinging an extra sacrificer",
			cost: 10000,
			requirements: function(ply){
				if (JSON.parse(ply.cultists).length > 1) return true;
				return false;
			},
			onBuy: function(ply){
				ply.maxsacrificers += 1;
				pushRepeatableUpgrade(this.id,ply);
			}
		},
		{
			name: "Additional Library",
			id: 8,
			description: "Allows assinging an extra researcher",
			cost: 10000,
			requirements: function(ply){
				if (JSON.parse(ply.cultists).length > 1) return true;
				return false;
			},
			onBuy: function(ply){
				ply.maxresearchers += 1;
				pushRepeatableUpgrade(this.id,ply);
			}
		},
		{
			name: "Raise Standards",
			id: 9,
			description: "Increase Sacrifice yield by 25%, but sacrificing takes an additional 25% longer",
			cost: 25000,
			requirements: function(ply){
				if (hasResearch((hasRepeatableUpgrade(9,ply)*100)^1.2,ply)) return true;
				return false;
			},
			onBuy: function(ply){
				ply.sacmult = Number(ply.sacmult) + 0.25;
				ply.sacrificespeedadd = Number(ply.sacrificespeedadd) + 1.75;
				pushRepeatableUpgrade(this.id,ply);
			}
		},
		{
			name: "Lower Standards",
			id: 10,
			description: "Remove one 'Raise Standards' upgrade.",
			cost: 0,
			requirements: function(ply){
				if (hasRepeatableUpgrade(9,ply) > 0) return true;
				return false;
			},
			onBuy: function(ply){
				ply.sacmult = Number(ply.sacmult);
				ply.sacrificespeedadd = Number(ply.sacrificespeedadd);
				ply.sacmult -= 0.25;
				ply.sacrificespeedadd -= 1.75;
				let x=0;
				for (let upgr of ply.upgrades.repeatable){
					if (upgr.id == 9){
						upgr.number--;
						if (upgr.number == 0){
							ply.upgrades.repeatable.splice(x,1);
						}
					}
					x++
				}
			}
		},
		{
			name: 'Filling the Shelves',
			id: 11,
			description: 'Increase sacrifice yield by 1% of your current sacrifices.',
			cost: 10000000,
			requirements: function(ply){
				if (hasUpgrade(12,ply) && hasRepeatableUpgrade(11,ply) <= 20 && hasResearch((hasRepeatableUpgrade(11,ply)*1000)^1.2,ply)) return true;
				return false;
			},
			onBuy: function(ply){
				ply.percentsac = Number(ply.percentsac)+1;
				pushRepeatableUpgrade(this.id,ply);
			}
		}
	]
}