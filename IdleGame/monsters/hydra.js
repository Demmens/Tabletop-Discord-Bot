const Monster = require('../Monster');

class Hydra extends Monster{
	constructor(){
		super({
			name: 'hydra',
			defence: 80,
			hp: 80,
			speed: 20,
			level: 7,
			turns: 3,
			attacks: [
				{
					hit: [
						"ENEMY snaps at CULTIST with its jaws, dealing",
						"ENEMY sinks its teeth into CULTIST, dealing",
						"ENEMY strikes at CULTIST with its maw, biting them for",
						"ENEMY thrusts one of its heads down into CULTIST, closing its jaws around them for"
					],
					miss: [
						"ENEMY snaps at CULTIST, but the attack is dodged.",
						"ENEMY bites, but CULTIST swiftly dodges out of the way."
					],
					damage: 75,
					chance: 0.79,
					type: 'piercing'
				},
				{
					hit: [
						"ENEMY opens its mouth and demonic lightning bursts forth, scorching CULTIST for"
					],
					miss: [
						"ENEMY opens its mouth and demonic lightning bursts forth, but CULTIST resists the damage."
					],
					damage: 70,
					targets: 3,
					chance: 0.07,
					targets: 3,
					type: 'lightning'
				},
				{
					hit: [
						"ENEMY opens its mouth and a burning blue frost sears forth, burning CULTIST"
					],
					miss: [
						"ENEMY opens its mouth and a burning blue frost sears forth, but CULTIST resists the cold."
					],
					damage: 70,
					targets: 3,
					chance: 0.07,
					targets: 3,
					type: 'cold'
				},
				{
					hit: [
						"ENEMY opens its mouth and a fierce fire launches forth, burning CULTIST for"
					],
					miss: [
						"ENEMY opens its mouth and a fierce fire launches forth, but CULTIST resists the damage."
					],
					damage: 70,
					targets: 3,
					chance: 0.07,
					targets: 3,
					type: 'fire'
				}	
			],
			drops: [
				{
					name: "Armour",
					chance: 0.2,
					materials: [
						'Rare', 'Epic', 'Legendary', 
						'Steel', 'Orichalcum', 'Adamantite',
						'Leather', 'Ogreskin', 'Dragonhide'
					],
					modify: [
						{
							baseName: 'Orichalcum',
							newName: 'Hydra Scale',
							defenceModifier: 1.15,
							valueModifier: 1.2,
							chance: 1
						},
						{
							baseName: 'Ogreskin',
							newName: 'Hydraskin',
							defenceModifier: 1.1,
							valueModifier: 1.1
						}
					]
				},
				{
					name: 'Weapon',
					chance: 0.2,
					materials: [
						'Rare', 'Epic', 'Legendary',
						'Steel', 'Orichalcum', 'Adamantite',
						'Carved', 'Ornate', 'Master Crafted'
					],
					modify: [
						{
							baseName: 'Orichalcum'
						}
					]
				},
				{
					name: 'Money',
					minNumber: 300000,
					maxNumber: 550000,
					chance: 1
				}
			]
		});
	}
}

module.exports = Hydra;