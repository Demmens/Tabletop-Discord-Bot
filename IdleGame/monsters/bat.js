const Monster = require('../Monster');

class Bat extends Monster{
	constructor(){
		super({
			name: 'bat',
			minNumber: 6,
			maxNumber: 8,
			speed: 15,
			emote: '🦇',
			attacks: [
				{
					hit: [
						"ENEMY swoops down at CULTIST, biting them for",
						"ENEMY flies at CULTIST and bites them for"
					],
					miss: [
						"ENEMY flutters around.",
						"ENEMY swoops at CULTIST, but is swiftly dodged.",
						"ENEMY flies in a circle",
						"ENEMY lets out a quiet screech"
					],
					damage: 8,
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
				}
			]
		});
	}
}

module.exports = Bat;