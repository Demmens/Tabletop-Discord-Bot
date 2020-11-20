const f2 = require('../commands/IdleGame/functions.js');
const f = require('../functions.js');

module.exports = {
	items: [

		//|-----------------|\\
		//|  Healing items  |\\
		//|-----------------|\\
		{
			name: 'Meat',
			description: 'Heals the eater a tiny amount. Consumed on use.',
			effect: function(owner){
				owner.health += this.healing;
				if (owner.health > owner.stats.con){
					owner.health = owner.stats.con;
				}
			},
			condition: function(owner){
				if (owner.health <= owner.stats.con/2 && owner.health <= owner.stats.con - this.healing){
					return true;
				}
				return false;
			},
			consumable: true,
			healing: 1,
			value: 1500
		},
		{
			name: 'Minor Potion of Healing',
			description: 'Heals the drinker a minor amount. Consumed on use.',
			effect: function(owner){
				owner.health += this.healing;
				if (owner.health > owner.stats.con){
					owner.health = owner.stats.con;
				}
			},
			condition: function(owner){
				if (owner.health <= owner.stats.con/2&& owner.health <= owner.stats.con - this.healing){
					return true;
				}
				return false;
			},
			consumable: true,
			healing: 2,
			value: 1500
		},
		{
			name: 'Potion of Healing',
			description: 'Heals the drinker a moderate amount. Consumed on use.',
			effect: function(owner){
				owner.health += this.healing;
				if (owner.health > owner.stats.con){
					owner.health = owner.stats.con;
				}

			},
			condition: function(owner){
				if (owner.health <= owner.stats.con/2&& owner.health <= owner.stats.con - this.healing){
					return true;
				}
				return false;
			},
			consumable: true,
			healing: 4,
			value: 4000
		},
		{
			name: 'Major Potion of Healing',
			description: 'Heals the drinker a major amount. Consumed on use.',
			effect: function(owner){
				owner.health += this.healing;
				if (owner.health > owner.stats.con){
					owner.health = owner.stats.con;
				}
			},
			condition: function(owner){
				if (owner.health <= owner.stats.con/2 && owner.health <= owner.stats.con - this.healing){
					return true;
				}
				return false;
			},
			consumable: true,
			healing: 8,
			value: 12000
		}


		//|-----------|\\
		//|    Misc   |\\
		//|-----------|\\
	]
}