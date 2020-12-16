const Monster = require('../Monster');

class Wolf extends Monster{	
	constructor(){
		super({
			name: 'wolf',
			plural: 'wolves',
			hp: 3,
			defence: 2,
			speed: 15,
			minNumber: 3,
			maxNumber: 5,
			weaknesses: ['piercing'],
			emote: '🐺',
			attacks: [
				{
					hit: [
						'ENEMY bites CULTIST, dealing',
						'ENEMY leaps and snaps at CULTIST, biting them for',
						'ENEMY sinks its teeth into CULTIST, dealing'
					],
					miss: [
						'ENEMY lunges at CULTIST, but misses.',
						'CULTIST swiftly dodges a bite from ENEMY.',
						'CULTIST blocks ENEMY\'s bite.'
					],
					damage: 5,
					chance: 1,
					type: 'piercing',
					effects: [
						{
							effect: 'bleed',
							chance: 0.3,
							potency: 1,
							duration: 2,
							stat: 'con',
							onHit: true
						}
					]
				}
			],
			drops: [
				{
					name: 'Armour',
					materials: ['Fur'],
					chance: 0.2,
					modify: [
						{
							baseName: 'Fur',
							newName: 'Wolf Pelt',
							chance: 0.5,
							defenceModifier: 1.1
						}
					]
				},
				{
					name: 'Money',
					chance: 1,
					minNumber: 1000,
					maxNumber: 5000
				}
			]
		});
	}
}

module.exports = Wolf;