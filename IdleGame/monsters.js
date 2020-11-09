

module.exports = {
	monsters: [
		{
			name: 'wolf',
			damage: 1,
			health: 5,
			weaknesses: ['piercing'],
			resistances: [],
			level: 0.5
		},
		{
			name: 'skeleton',
			damage: 1,
			health: 4,
			weaknesses: ['bludgeoning', 'radiant'],
			resistances: ['piercing', 'necrotic'],
			level: 0.5
		},
		{
			name: 'bat',
			damage: 1,
			health: 1,
			weaknesses: [],
			resistances: [],
			level: 0.2
		}
	]
}