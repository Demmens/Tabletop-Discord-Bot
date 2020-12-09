const Monster = require('../Monster');

class Skeleton extends Monster{
	constructor(){
		super({
			name: 'skeleton',
			hp: 4,
			defence: 5,
			speed: 2,
			weaknesses: ['bludgeoning', 'radiant'],
			resistances: ['piercing', 'necrotic'],
			minNumber: 2,
			maxNumber: 3,
			emote: '💀',
			attacks:[
				{
					hit: [
						"Bringing their sword down, ENEMY cleaves CULTIST for",
						"ENEMY stabs CULTIST, dealing ",
						"ENEMY slashes wildly at CULTIST, cutting them for"
					],
					miss: [
						"CULTIST ducks out of the way of ENEMY's wild swing.",
						"CULTIST parries ENEMY's sword swing.",
						"ENEMY swings and misses CULTIST"
					],
					damage: 25,
					chance: 1,
					type: 'slashing'
				}
			],
			drops: [
				{
					name: 'Weapon',
					bases: ['Shortsword', 'Longsword', 'Greatsword', 'Dagger'],
					materials: ['Iron', 'Steel'],
					prefixes: ['Rusty', 'Shoddy', 'Broken'],
					chance: 0.2,
					modify: [
						{
							baseName: 'Steel',
							newName: 'Bone',
							damageModifier: 1.2,
							valueModifier: 0.8,
							chance: 0.3
						}
					]
				},
				{
					name: 'Armour',
					materials: ['Iron', 'Steel'],
					prefixes: ['Rusty', 'Shoddy', 'Broken'],
					chance: 0.15
				},
				{
					name: 'Money',
					chance: 1,
					minNumber: 1000,
					maxNumber: 5000
				},
			]
		})
	}
}

module.exports = Skeleton;