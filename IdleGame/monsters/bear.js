const Monster = require('../Monster');

class Bear extends Monster{
	constructor(){
		super({
			name: 'bear',
			defence: 50,
			hp: 18,
			speed: 15,
			weaknesses: ['fire'],
			resistances: ['cold'],
			level: 1,
			emote: '🐻',
			attacks: [
				{
					hit: [
						"ENEMY swipes its claws at CULTIST, goring them for",
						"ENEMY rears up on its hind legs, then slashes at CULTIST for",
						"ENEMY roars and cuts CULTIST with its claws, dealing"
					],
					miss: [
						"ENEMY swipes at CULTIST, but they dodge the attack.",
						"ENEMY slashes towards CULTIST with its claws, but misses"
					],
					damage: 100,
					chance: 0.7,
					type: 'slashing'
				},
				{
					hit: [
						"ENEMY bites at CULTIST, tearing them for",
						"ENEMY roars and sinks its teeth into CULTIST, dealing",
						"ENEMY tears at CULTIST with its teeth, dealing"
					],
					miss: [
						"ENEMY bites at CULTIST, but misses",
						"ENEMY snaps at CULTIST, but they dodge out of the way."
					],
					damage: 130,
					chance: 0.3,
					type: 'piercing'
				}
			],
			drops: [
				{
					name: 'Money',
					chance: 1,
					minNumber: 5000,
					maxNumber: 10000
				},
				{
					name: 'Armour',
					chance: 0.25,
					materials: ["Fur","Leather"],
					modify: [
						{
							baseName: 'Leather',
							newName: 'Bear Hide',
							defenceModifier: 1.1,
							chance: 1
						},
						{
							baseName: 'Fur',
							newName: 'Bear Fur',
							defenceModifier: 1.1,
							chance: 1
						}
					]
				}
			]
		});
	}
}

module.exports = Bear;