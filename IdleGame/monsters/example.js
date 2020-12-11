const Monster = require('../Monster');

class EXAMPLE extends Monster {
	constructor(){
		super({
			name = '', //Name
			plural = null, //Plural name
			hp = 1, //Health
			defence = 1,
			minNumber = 1, //Min number of monsters that can spawn
			maxNumber = 1, //Max number of monsters that can spawn
			speed = 0, //How early in initiative the monster goes
			weaknesses = [], //Damage types the monster is weak to
			resistances = [], // Damage types the monster resists
			level = -1, //Level combats the monster appears in.
			emote = '💢', //Emote for combat log.
			turns = 1, //Number of attacks per round the monster has.
			attacks = [ //Attacks
				{
					hit: [], //Text for attacks hitting.
					miss: [], //Text for missing.
					damage: 0, //Damage
					chance: 1, // Chance of using this attack. (Chances must add to 1 total.)
					type: 'slashing', //Damage type
					targets: 1 //How many enemies the attack hits.
				}
			], 
			drops = [ //Loot
				{
					name: 'Money', //Drop money
					minNumber: 0, //Min money it can drop
					maxNumber: 0, //Max money it can drop
					chance: 0.5 //Chance of the money dropping
				},
				{
					name: 'Weapon', //Drop weapon
					chance: 0.5, //Chance to drop weapon
					materials: [], //Which materials it can drop
					modify: [ //Replace certain factors of weapon drops
						{
							baseName: 'Steel', // Part of weapon name to replace
							newName: 'Dark Steel', // Thing to change it to. (Example `Broken Steel Warhammer of Fire` => `Broken Dark Steel Warhammer of Fire`)
							valueModifier: 1.3, // Modify the cost of the weapon
							damageModifier: 1.2, // Modify the damage of the weapon
							chance: 0.5 // Chance of this modification happening
						}
					]
				},
				{
					name: 'Armour', //Drop armour
					chance: 0.5, //Chance to drop armour
					materials: [], //Which materials it can drop
					modify: [ //Replace certain factors of armour drops
						{
							baseName: 'Steel', // Part of armour name to replace
							newName: 'Dark Steel', // Thing to change it to. (Example `Broken Steel Chestplate of Fire` => `Broken Dark Steel Chestplate of Fire`)
							valueModifier: 1.3, // Modify the cost of the armour
							defenceModifier: 1.2, // Modify the defence of the armour
							chance: 0.5 // Chance of this modification happening
						}
					]
				}
			], 
		});
	}
}

module.exports = Dragon;