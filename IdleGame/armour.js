//Armour Types
const TYPE_HEAVY = 'heavy';
const TYPE_LIGHT = 'light';
const TYPE_MAGIC = 'magic';
const f = require('../functions.js');

module.exports = {

	generateRandomArmour: function(id,guaranteePrefix, guaranteeSuffix){
		const prefixChance = 0.35;
		const suffixChance = 0.2;

		let armour = {};
		let base = f.arrRandom(this.bases); //Pick a random base item
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
		material = f.arrRandom(matTbl);

		let prefix;
		//Randomise prefix
		if (guaranteePrefix || Math.random()<= prefixChance){
			let prefTbl = [];
			for (let i of this.prefixes){
				let hasType;
				if (i.types){
					for (let j of i.types){ //Prefixes can only be applied to the correct armour type
						if (j == base.type){
							hasType == true;
						}
					}
				} else hasType = true; //If the types are not specified, assume it can apply to any type.
				if (hasType){
					for (let j=0;j<i.abundance;j++){ //Take rarity into account.
						prefTbl.push(i);
					}
				}
			}
			prefix = f.arrRandom(prefTbl);
		}
		
		let suffix;
		//Randomise suffix
		if (guaranteeSuffix || Math.random()<= suffixChance){		
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
			suffix = f.arrRandom(suffTbl);
		}

		if (!suffix){
			suffix = {
				name:'',
				value:1
			}
		}
		if (!prefix){
			prefix = {
				name:'',
				value:1,
				multiplier:1,
			}
		}

		//Create stats
		armour.name = prefix.name + material.name + f.arrRandom(base.names) + suffix.name;
		armour.id = id;
		armour.defence = Math.floor(base.multiplier * prefix.multiplier * material.modifier * 10);
		armour.type = base.type;
		if (prefix.overrideType) armour.type = prefix.overrideType;
		armour.equip = base.equip;

		armour.resistances = [];
		if (prefix.addResistance) armour.resistances.push(prefix.addResistance);
		if (suffix.addResistance) armour.resistances.push(suffix.addResistance);

		armour.effectImmunities = [];
		if (prefix.effectImmunity) armour.effectImmunities.push(prefix.effectImmunity);
		if (suffix.effectImmunity) armour.effectImmunities.push(suffix.effectImmunity);

		armour.effects = [];
		if (prefix.addEffect) armour.effects.push(prefix.addEffect);
		if (suffix.addEffect) armour.effects.push(suffix.addEffect);

		armour.value = Math.floor(20*base.multiplier*prefix.value*suffix.value*material.value)*2500;

		return armour;
	},

	bases: [
		{
			names: ['Helmet', 'Coif', 'Mask'],
			type: TYPE_HEAVY,
			equip: 'head',
			multiplier: 1,
			material: 'metal'
		},
		{
			names: ['Chestplate', 'Cuirass', 'Plate', 'Mail'],
			type: TYPE_HEAVY,
			equip: 'body',
			multiplier: 1.5,
			material: 'metal'
		},
		{
			names: ['Greaves', 'Leggings'],
			type: TYPE_HEAVY,
			equip: 'legs',
			multiplier: 1.2,
			material: 'metal'
		},
		{
			names: ['Sabatons', 'Boots'],
			type: TYPE_HEAVY,
			equip: 'feet',
			multiplier: 0.85,
			material: 'metal'
		},
		{
			names: ['Gauntlets', 'Gloves'],
			type: TYPE_HEAVY,
			equip: 'hands',
			multiplier: 0.7,
			material: 'metal'
		},
		{
			names: ['Hat', 'Hood'],
			type: TYPE_LIGHT,
			equip: 'head',
			multiplier: 0.8,
			material: 'leather'
		},
		{
			names: ['Cowl', 'Cloak', 'Armour'],
			type: TYPE_LIGHT,
			equip: 'body',
			multiplier: 1,
			material: 'leather'
		},
		{
			names: ['Trousers','Greaves','Slacks'],
			type: TYPE_LIGHT,
			equip: 'legs',
			multiplier: 0.9,
			material: 'leather'
		},
		{
			names: ['Gloves'],
			type: TYPE_LIGHT,
			equip: 'hands',
			multiplier: 0.5,
			material: 'leather'
		},
		{
			names: ['Robes'],
			type: TYPE_MAGIC,
			equip: 'body',
			multiplier: 2,
			material: 'magic'
		}
	],
	prefixes: [
		{
			name: 'Ethereal ',
			overrideType: TYPE_MAGIC,
			value: 2.5,
			multiplier: 1,
			types: [TYPE_LIGHT, TYPE_HEAVY],
			abundance: 4
		},
		{
			name: 'Guarding ',
			value: 1.5,
			multiplier: 1.3,
			types: [TYPE_LIGHT, TYPE_HEAVY, TYPE_MAGIC],
			abundance: 15
		},
		{
			name: 'Warding ',
			value: 2.2,
			multiplier: 1.6,
			types: [TYPE_LIGHT, TYPE_HEAVY, TYPE_MAGIC],
			abundance: 7
		},
		{
			name: 'Damaged ',
			value: 0.8,
			multiplier: 0.7,
			types: [TYPE_LIGHT, TYPE_HEAVY, TYPE_MAGIC],
			abundance: 15
		},
		{
			name: 'Inert ',
			value: 0.5,
			multiplier: 0.3,
			types: [TYPE_MAGIC],
			abundance: 5
		},
		{
			name: 'Weightless ',
			overrideType: TYPE_LIGHT,
			value: 2,
			multiplier: 1,
			types: [TYPE_HEAVY],
			abundance: 3
		},
		{
			name: 'Padded ',
			addResistance: 'bludgeoning',
			value: 1.5,
			multiplier: 1,
			types: [TYPE_HEAVY],
			abundance: 10
		},
		{
			name: 'Ancient ',
			value: 1.8,
			multiplier: 0.8,
			types: [TYPE_HEAVY, TYPE_LIGHT],
			abundance: 2
		},
		{
			name: 'Ancient ',
			value: 2,
			multiplier: 1.2,
			types: [TYPE_MAGIC],
			abundance: 2
		}
	],
	suffixes: [
		{
			name: ' of Fire',
			value: 1.4,
			abundance: 4,
			addResistance: 'fire',
			effectImmunity: 'burn'
		},
		{
			name: ' of Ice',
			value: 1.3,
			abundance: 7,
			addResistance: 'cold',
			effectImmunity: 'slow'
		},
		{
			name: ' of Lightning',
			value: 1.5,
			abundance: 4,
			addResistance: 'lightning',
			effectImmunity: 'stun'
		},
		{
			name: ' of Light',
			value: 2,
			abundance: 1,
			addResistance: 'radiant',
			addEffect: 'blind'
		},
		{
			name: ' of Dark',
			value: 2,
			abundance: 1,
			addResistance: 'necrotic',
			effectImmunity: 'blind'
		},
		{
			name: ' of Earth',
			value: 1.3,
			abundance: 6,
			addResistance: 'bludgeoning'
		},
		{
			name: ' of Thorns',
			value: 1.2,
			abundance: 7,
			addEffect: 'thorns'
		}
	],
	materials: {
		metals:	[
			{
				name: "Iron ",
				modifier: 1,
				abundance: 64,
				value: 1
			},
			{
				name: "Steel ",
				modifier: 2,
				abundance: 16,
				value: 5
			},
			{
				name: "Orichalcum ",
				modifier: 4,
				abundance: 4,
				value: 35
			},
			{
				name: "Adamantite ",
				modifier: 8,
				abundance: 1,
				value: 300
			}
		],
		leathers: [
			{
				name: "Cloth ",
				modifier: 1,
				abundance: 64,
				value: 1
			},
			{
				name: "Leather ",
				modifier: 2,
				abundance: 16,
				value: 5
			},
			{
				name: "Ogreskin ",
				modifier: 4,
				abundance: 4,
				value: 35
			},
			{
				name: "Dragonhide ",
				modifier: 8,
				abundance: 1,
				value: 300
			}
		],
		magic: [
			{
				name: "Common ",
				modifier: 1,
				abundance: 64,
				value: 1
			},
			{
				name: "Rare ",
				modifier: 2,
				abundance: 16,
				value: 5
			},
			{
				name: "Epic ",
				modifier: 4,
				abundance: 4,
				value: 35
			},
			{
				name: "Legendary ",
				modifier: 8,
				abundance: 1,
				value: 300
			}
		]
	}
}