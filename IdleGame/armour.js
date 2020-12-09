//Armour Types
const TYPE_HEAVY = 'heavy';
const TYPE_LIGHT = 'light';
const TYPE_MAGIC = 'magic';
const f = require('../functions.js');

module.exports = {

	randomiseMaterial: function(base){
		let material;
		if (base.material == 'metal'){
			material = this.materials.metals;
		} else if (base.material == 'leather'){
			material = this.materials.leathers;
		} else if (base.material == 'magic'){
			material = this.materials.magic;
		}

		//Randomise material
		let matTbl = [];
		for (let i of material){
			for (let j=0;j<i.abundance;j++){
				matTbl.push(i);
			}
		}
		return f.arrRandom(matTbl);
	},

	randomisePrefix: function(base){
		let prefTbl = [];
		for (let i of this.prefixes){
			let hasType;
			if (i.types){
				for (let j of i.types){ //Prefixes can only be applied to the correct armour type
					if (j == base.type){
						hasType = true;
					}
				}
			} else hasType = true; //If the types are not specified, assume it can apply to any type.
			if (hasType){
				for (let j=0;j<i.abundance;j++){ //Take rarity into account.
					prefTbl.push(i);
				}
			}
		}
		return f.arrRandom(prefTbl);
	},

	randomiseSuffix: function(base){
		let suffTbl = [];
		for (let i of this.suffixes){
			let hasType;
			if (i.types){
				for (let j of i.types){ //Suffixes can only be applied to the correct armour type
					if (j == base.type){
						hasType == true;
					}
				}
			} else hasType = true; //If the types are not specified, assume it can apply to any type.
			if (hasType){
				for (let j=0;j<i.abundance;j++){ //Take rarity into account.
					suffTbl.push(i);
				}
			}
		}
		return f.arrRandom(suffTbl);
	},

	generateItem: function(id,base,material,prefix,suffix){
		let armour = {};

		let of = ' '
		if (!prefix){
			prefix = {
				name:'',
				value:1,
				multiplier:1,
			}
		}
		if (!suffix){
			suffix = {
				name:'',
				value:1
			}
		} else of = ' of '

		armour.name = prefix.name + ' ' + material.name + ' ' + f.arrRandom(base.names) + of + suffix.name;
		armour.id = id;
		armour.defence = Math.floor(base.multiplier * prefix.multiplier * material.modifier * 10);
		armour.type = base.type;
		if (prefix.overrideType) armour.type = prefix.overrideType;
		armour.equip = base.equip;
		armour.base = base.id;
		armour.prefix = prefix.id;
		armour.suffix = suffix.id;

		armour.value = Math.floor(40*base.multiplier*prefix.value*suffix.value*material.value)*2500;
		return armour;
	},

	generateRandomArmour: function(id,guaranteePrefix, guaranteeSuffix){
		const prefixChance = 0.35;
		const suffixChance = 0.2;

		//Randomise base
		let base = f.arrRandom(this.bases); 

		//Randomise material
		const material = this.randomiseMaterial(base);

		let prefix;
		//Randomise prefix
		if (guaranteePrefix || Math.random() <= prefixChance){
			prefix = this.randomisePrefix(base);
		}
		
		let suffix;
		//Randomise suffix
		if (guaranteeSuffix || Math.random()<= suffixChance){		
			suffix = this.randomiseSuffix(base);
		}

		//Create stats
		let armour = this.generateItem(id,base,material,prefix,suffix);

		return armour;
	},

	bases: [
		{
			id: 1,
			names: ['Helmet', 'Coif', 'Mask'],
			type: TYPE_HEAVY,
			equip: 'head',
			multiplier: 1,
			material: 'metal'
		},
		{
			id: 2,
			names: ['Chestplate', 'Cuirass', 'Plate', 'Mail'],
			type: TYPE_HEAVY,
			equip: 'body',
			multiplier: 1.5,
			material: 'metal'
		},
		{
			id: 3,
			names: ['Greaves', 'Leggings'],
			type: TYPE_HEAVY,
			equip: 'legs',
			multiplier: 1.2,
			material: 'metal'
		},
		{
			id: 4,
			names: ['Sabatons', 'Boots'],
			type: TYPE_HEAVY,
			equip: 'feet',
			multiplier: 0.85,
			material: 'metal'
		},
		{
			id: 5,
			names: ['Gauntlets', 'Gloves'],
			type: TYPE_HEAVY,
			equip: 'hands',
			multiplier: 0.7,
			material: 'metal'
		},
		{
			id: 6,
			names: ['Hat', 'Hood'],
			type: TYPE_LIGHT,
			equip: 'head',
			multiplier: 0.8,
			material: 'leather'
		},
		{
			id: 7,
			names: ['Cowl', 'Cloak', 'Armour'],
			type: TYPE_LIGHT,
			equip: 'body',
			multiplier: 1,
			material: 'leather'
		},
		{
			id: 8,
			names: ['Trousers','Greaves','Slacks'],
			type: TYPE_LIGHT,
			equip: 'legs',
			multiplier: 0.9,
			material: 'leather'
		},
		{
			id: 9,
			names: ['Gloves'],
			type: TYPE_LIGHT,
			equip: 'hands',
			multiplier: 0.5,
			material: 'leather'
		},
		{
			id: 10,
			names: ['Robes'],
			type: TYPE_MAGIC,
			equip: 'body',
			multiplier: 2,
			material: 'magic'
		}
	],
	prefixes: [
		{	
			id: 1,
			name: 'Ethereal',
			overrideType: TYPE_MAGIC,
			value: 2.5,
			multiplier: 1,
			types: [TYPE_LIGHT, TYPE_HEAVY],
			abundance: 4
		},
		{
			id: 2,
			name: 'Guarding',
			value: 1.5,
			multiplier: 1.3,
			types: [TYPE_LIGHT, TYPE_HEAVY, TYPE_MAGIC],
			abundance: 15
		},
		{
			id: 3,
			name: 'Warding',
			value: 2.2,
			multiplier: 1.6,
			types: [TYPE_LIGHT, TYPE_HEAVY, TYPE_MAGIC],
			abundance: 7
		},
		{
			id: 4,
			name: 'Damaged',
			value: 0.8,
			multiplier: 0.7,
			types: [TYPE_LIGHT, TYPE_HEAVY, TYPE_MAGIC],
			abundance: 15
		},
		{
			id: 5,
			name: 'Inert',
			value: 0.5,
			multiplier: 0.3,
			types: [TYPE_MAGIC],
			abundance: 5
		},
		{
			id: 6,
			name: 'Weightless',
			overrideType: TYPE_LIGHT,
			value: 2,
			multiplier: 1,
			types: [TYPE_HEAVY],
			abundance: 3
		},
		{
			id: 7,
			name: 'Padded',
			addResistance: 'bludgeoning',
			value: 1.5,
			multiplier: 1,
			types: [TYPE_HEAVY],
			abundance: 10
		},
		{
			id: 8,
			name: 'Ancient',
			value: 1.8,
			multiplier: 0.8,
			types: [TYPE_HEAVY, TYPE_LIGHT],
			abundance: 2
		},
		{
			id: 9,
			name: 'Ancient',
			value: 2,
			multiplier: 1.2,
			types: [TYPE_MAGIC],
			abundance: 2
		}
	],
	suffixes: [
		{
			id: 1,
			name: 'Fire',
			value: 1.4,
			abundance: 4,
			addResistance: 'fire',
			effectImmunity: 'burn'
		},
		{
			id: 2,
			name: 'Ice',
			value: 1.3,
			abundance: 7,
			addResistance: 'cold',
			effectImmunity: 'slow'
		},
		{
			id: 3,
			name: 'Lightning',
			value: 1.5,
			abundance: 4,
			addResistance: 'lightning',
			effectImmunity: 'stun'
		},
		{
			id: 4,
			name: 'Light',
			value: 2,
			abundance: 1,
			addResistance: 'radiant',
			addEffect: 'blind'
		},
		{
			id: 5,
			name: 'Dark',
			value: 2,
			abundance: 1,
			addResistance: 'necrotic',
			effectImmunity: 'blind'
		},
		{
			id: 6,
			name: 'Earth',
			value: 1.3,
			abundance: 6,
			addResistance: 'bludgeoning'
		},
		{
			id: 7,
			name: 'Thorns',
			value: 1.2,
			abundance: 7,
			addEffect: 'thorns'
		}
	],
	materials: {
		metals:	[
			{
				name: "Iron",
				modifier: 1,
				abundance: 64,
				value: 1
			},
			{
				name: "Steel",
				modifier: 2,
				abundance: 16,
				value: 5
			},
			{
				name: "Orichalcum",
				modifier: 4,
				abundance: 4,
				value: 35
			},
			{
				name: "Adamantite",
				modifier: 8,
				abundance: 1,
				value: 300
			}
		],
		leathers: [
			{
				name: "Cloth",
				modifier: 1,
				abundance: 32,
				value: 1
			},
			{
				name: "Fur",
				modifier: 1,
				abundance: 32,
				value: 1
			},
			{
				name: "Leather",
				modifier: 2,
				abundance: 10,
				value: 5
			},
			{
				name: "Ogreskin",
				modifier: 4,
				abundance: 4,
				value: 35
			},
			{
				name: "Dragonhide",
				modifier: 8,
				abundance: 1,
				value: 300
			}
		],
		magic: [
			{
				name: "Common",
				modifier: 1,
				abundance: 64,
				value: 1
			},
			{
				name: "Rare",
				modifier: 2,
				abundance: 16,
				value: 5
			},
			{
				name: "Epic",
				modifier: 4,
				abundance: 4,
				value: 35
			},
			{
				name: "Legendary",
				modifier: 8,
				abundance: 1,
				value: 300
			}
		]
	}
}