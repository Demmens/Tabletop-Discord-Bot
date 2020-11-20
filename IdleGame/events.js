const f = require(`../../commands/IdleGame/functions.js`);

module.exports = {
	events: [
		{
			name: 'Wolves',
			description: `While out exploring in search of treasure, CULTISTNAME hears a rustling from the nearby undergrowth, followed by sounds of snarling all around. Wolves.`,
			choices: [
				'Attack the wolves',
				'Run away'
			],
			begin: function(cultist){
				return;
			},
			result: function(cultist, choice){
				if (choice == 1){
					let ab = f.calcAttackBonus(cultist);
					const wolfAttack = 4;

					if (wolfAttack - ab > 0){
						cultist.health -= (wolfAttack-ab);
						if (cultist.health == 0){
							return `${cultist.name} gets completely overwhelmed by the wolves, and is killed.`
						}
						return `${cultist.name} takes ${wolfAttack-ab} damage, but manages to finish off the wolves. You gain 5 meat.`;
					}

					return `${cultist.name} swiftly defeats the wolves without even taking a scratch. You gain 5 meat.`

				} else if (choice == 2){
					return `${cultist.name} runs as fast as they can, and the wolves don't seem to follow.`;
				}
			},
			requirement: function(cultist){
				return true;
			}
		}
	]
}