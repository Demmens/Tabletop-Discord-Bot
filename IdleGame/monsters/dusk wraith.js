const Monster = require('../Monster');

class DuskWraith extends Monster{	
	constructor(){
		super({
			name: 'Dusk Wraith',
			hp: 50,
			defence: 150,
			speed: 15,
			minNumber: 1,
			maxNumber: 1,
			level: 3,
			weaknesses: ['radiant', 'fire'],
			resistances: ['necrotic', 'cold'],
			emote: '👻',
			attacks: [
				{
					miss: [
						'ENEMY lets out an ear-piercing wail.',
						'ENEMY makes a horrific shriek.',
						'ENEMY lets out a horrific sriek.'
					],
					damage: 0,
					chance: 0.2,
					type: 'necrotic',
					targets: 3,
					effects: [
						{
							effect: 'fear',
							chance: 1,
							potency: 1,
							duration: 2,
							stat: 'wis'
						}
					]
				},
				{
					hit: [
						`ENEMY flies at CULTIST and swipes at them with its claws, dealing`,
						`ENEMY slashes at CULTIST with its claws, tearing them for`,
						`ENEMY shrieks and swipes at CULTIST, dealing`
					],
					miss: [
						`ENEMY swipes at CULTIST, but the attack is blocked.`,
						`ENEMY slashes its claws at CULTIST, but they swiftly dodge the attack.`
					],
					damage: 20,
					chance: 0.8,
					type: 'necrotic',
					targets: 1,
					effects: [
						{
							effect: 'fear',
							chance: 0.5,
							potency: 1,
							duration: 1,
							stat: 'wis'
						}
					]
				}
			],
			drops: [
				{
					name: 'Armour',
					prefixes: ['Ethereal'],
					suffixes: ['Night'],
					chance: 0.05,
					modify: [
						{
							baseName: 'of Night',
							newName: 'of Souls',
							chance: 1,
							defenceModifier: 1.2,
							valueModifier: 1.25
						}
					]
				},
				{
					name: 'Weapon',
					prefixes: ['Ethereal'],
					suffixes: ['Night'],
					chance: 0.05,
					modify: [
						{
							baseName: 'of Night',
							newName: 'of Souls',
							chance: 1,
							damageModifier: 1.2,
							valueModifier: 1.25
						}
					]
				},
				{
					name: 'Armour',
					chance: 0.1
				},
				{
					name: 'Weapon',
					chance: 0.1
				},
				{
					name: 'Money',
					chance: 1,
					minNumber: 10000,
					maxNumber: 50000
				}
			]
		});
	}
}

module.exports = DuskWraith;