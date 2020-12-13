const Monster = require('../Monster');

class Bandit extends Monster{
	constructor(){
		super({
			name: 'bandit',
			minNumber: 2,
			maxNumber: 3,
			level: 1,
			hp: 8,
			speed: 15,
			attacks: [
				{
					hit: [
						"ENEMY lunges at CULTIST with their knife, stabbing them for",
						"ENEMY stabs CULTIST, dealing",
						"ENEMY shanks CULTIST for",
						"ENEMY slashes at CULTIST with their knife, dealing"
					],
					miss: [
						"ENEMY slashes at CULTIST with their knife, but the attack is swiftly dodged.",
						"CULTIST blocks a knife attack from ENEMY.",
						"ENEMY stabs towards CULTIST with their knife, but it's blocked.",
						"ENEMY laughs."
					],
					damage: 20,
					chance: 1,
					type: 'piercing'
				}
				
			],
			drops: [
				{
					name: 'Money',
					chance: 1,
					minNumber: 2000,
					maxNumber: 4000
				},
				{
					name: 'Weapon',
					chance: 0.5,
					bases: ['Dagger'],
					materials: ['Iron', 'Steel']
				},
				{
					name: 'Armour',
					chance: 0.1,
					materials: ['Leather']
				}
			]
		});
	}
}

module.exports = Bandit;