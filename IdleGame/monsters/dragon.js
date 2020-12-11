const Monster = require('../Monster');

class Dragon extends Monster {
	constructor(){
		super({
			name: 'dragon',
			defence: 100,
			hp: 100,
			speed: 30,
			resistances: ['fire'],
			level: 10,
			emote: '🐲',
			turns: 2,
			attacks: [
				{
					hit: [
						"ENEMY sinks its teeth into CULTIST, dealing",
						"ENEMY rears its head back and snaps at CULTIST for",
						"ENEMY crushes CULTIST in its jaws, dealing"
					],
					miss: [
						"ENEMY snaps at CULTIST, but they quickly dodge out of the way.",
						"CULTIST sees ENEMY's bite, and dodges."
					],
					damage: 100,
					chance: 0.4,
					type: 'piercing'
				},
				{
					hit: [
						"The dragon lets out a roar, and torrents of fire stream from its mouth, burning CULTIST for",
						"The dragon lowers its head and a white fire screams from its mouth, scorching CULTIST for",
					],
					miss: [
						"Torrents of fire stream from the dragons mouth, but CULTIST swiftly ducks out of the way."
					],
					damage: 200,
					chance: 0.05,
					type: 'fire',
					targets: 3
				},
				{
					hit: [
						"The dragon slams its claws down on CULTIST, rending them for",
						"The dragon's claws cut through CULTIST for",
						"The dragon flashes its claws and tears through CULTIST, dealing"
					],
					miss: [
						"The dragon slashes its claws at CULTIST, but they narrowly duck out of the way",
						"The dragon's claws swipe at CULTIST, but they dodge."
					],
					damage: 85,
					chance: 0.55,
					type: 'slashing'
				}
			],
			drops: [
				{
					name: 'Money',
					minNumber: 1000000,
					maxNumber: 5000000,
					chance: 1
				},
				{
					name: 'Armour',
					chance: 0.2,
					materials: ['Adamantite', 'Legendary', 'Dragonhide', 'Epic', 'Orichalcum', 'Ogreskin'],
					modify: [
						{
							baseName: 'Adamantite',
							newName: 'Dragon Scale',
							valueModifier: 1.3,
							defenceModifier: 1.2,
							chance: 0.1
						},
						{
							baseName: 'Adamantite',
							newName: 'Dragonbone',
							valueModifier: 1.1,
							defenceModifier: 1.1,
							chance: 0.2
						},
						{
							baseName: 'Legendary',
							newName: 'Mythic',
							valueModifier: 1.5,
							defenceModifier: 1.5,
							chance: 0.1
						}
					]
				},
				{
					name: 'Weapon',
					chance: 0.2,
					materials: ['Adamantite', 'Master Crafted', 'Legendary', 'Orichalcum', 'Epic', 'Ornate'],
					modify: [
						{
							baseName: 'Adamantite',
							newName: 'Dragonbane',
							valueModifier: 1.3,
							damageModifier: 1.2,
							chance: 0.1
						},
						{
							baseName: 'Legendary',
							newName: 'Mythic',
							valueModifier: 1.5,
							damageModifier: 1.5,
							chance: 0.1
						}
					]
				}
			]
		});
	}
}

module.exports = Dragon;