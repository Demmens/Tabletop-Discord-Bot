const Monster = require('../Monster');

class RockTroll extends Monster{
	constructor(){
		super({
			name: 'rock troll',
			defence: 40,
			hp: 15,
			minNumber: 2,
			maxNumber: 2,
			speed: 5,
			weaknesses: ['cold'],
			resistances: ['fire', 'lightning', 'piercing'],
			level: 2,
			attacks: [
				{
					hit: [
						"ENEMY tosses a boulder at CULTIST, dealing",
						"ENEMY grabs the nearest rock and hurls it at CULTIST, dealing"
					],
					miss: [
						"ENEMY grabs the nearest rock and hurls it at CULTIST, but the throw goes wide.",
						"ENEMY searches for a nearby boulder, but can't find any. It looks sad.",
						"EMEMY tosses a boulder at CULTIST, but they swiftly dodge the attack."
					],
					damage: 75,
					chance: 0.35,
					type: 'bludgeoning'
				},
				{
					hit: [
						"ENEMY throws its fist at CULTIST, smacking them for",
						"ENEMY punches CULTIST for"
					],
					miss: [
						"ENEMY throws a slow punch at CULTIST, but they swiftly dodge the attack.",
						"ENEMY tries to punch CULTIST, but can't decide which fist to use.",
						"ENEMY punches at CULTIST, but misses."
					],
					damage: 55,
					chance: 0.65,
					type: 'bludgeoning'
				}	
			],
			drops: [
				{
					name: "Armour",
					chance: 0.2,
					materials: ["Iron", "Steel"],
					modify: [
						{
							baseName: 'Iron',
							newName: 'Rock',
							defenceModifier: 1.05,
							valueModifier: 0.95,
							chance: 1
						},
						{
							baseName: 'Steel',
							newName: 'Boulder',
							defenceModifier: 1.05,
							valueModifier: 0.95,
							chance: 1
						}
					]
				},
				{
					name: 'Money',
					minNumber: 5000,
					maxNumber: 10000,
					chance: 1
				}
			]
		});
	}
}

module.exports = RockTroll;