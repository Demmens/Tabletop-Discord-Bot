//Weapon Types
const TYPE_ONEHANDED = 'One Handed';
const TYPE_TWOHANDED = 'Two Handed';
const TYPE_THROWN = 'Thrown';
const TYPE_MAGIC = 'Magic';
const TYPE_RANGED = 'Ranged';



module.exports = {

	generateRandomItem: function(id,guaranteePrefix, guaranteeSuffix){
		let prefixChance = 0.35 //Change to balance
		let suffixChance = 0.1

		if (guaranteePrefix) prefixChance = 1;
		if (guaranteeSuffix) suffixChance = 1;

		let item = {};
		let num = Math.floor(Math.random()*this.bases.length);
		let base = this.bases[num];
		if (base.type == TYPE_MAGIC) suffixChance = 1; //Magic weapons will always have a suffix

		let prefix;
		let suffix;
		let material;

		//This is probably a terrible way of randomising with different weights, but I can't think of anything better rn.
		if (Math.random() <= prefixChance){
			let prefixTbl = [];
			for (let i of this.prefixes){
				let canHave;
				for (let j of i.types){
					if (j == base.type) canHave = true;
				}
				if (canHave){
					for (let j=0; j<i.abundance; j++){
						prefixTbl.push(i); //Create table so we can give the correct probabilities
					}
				}
			}
			num = Math.floor(Math.random()*prefixTbl.length);
			prefix = prefixTbl[num];
		}
		if (Math.random() <= suffixChance){
			let suffixTbl = [];
			for (let i of this.suffixes){
				for (let j=0; j<i.abundance; j++){
					suffixTbl.push(i); //Create table so we can give the correct probabilities
				}
			}
			num = Math.floor(Math.random()*suffixTbl.length);
			suffix = suffixTbl[num];
		}

		let materialTbl = [];
		let mat;
		if (base.material == 'metal') mat = this.materials.metals;
		if (base.material == 'wood') mat = this.materials.woods;
		if (base.material == 'magic') mat = this.materials.magic;

		for (let i of mat){
			for (let j=0;j <i.abundance;j++){
				materialTbl.push(i);
			}
		}
		num = Math.floor(Math.random()*materialTbl.length);
		material = materialTbl[num];

		item.damage = base.multiplier*material.damage;
		item.value = material.value*base.multiplier;
		item.dmgType = base.damage;
		item.type = base.type;
		item.stat = base.stat;
		item.name = '';
		item.id = id;
		item.prefix = prefix;

		if (prefix){
			item.name += prefix.name;
			item.damage *= prefix.damage;
			item.value *= prefix.value;
			if (prefix.overrideType) item.type = prefix.overrideType;	
		}

		item.name += material.name + base.name;

		if (suffix){
			item.name += suffix.name;
			if (suffix.overrideDamage) item.dmgType = suffix.overrideDamage;
			item.damage *= suffix.damage;
			item.value *= suffix.value;
		}

		item.value = Math.floor(item.value*20)*250;
		item.damage = Math.floor(item.damage*10);

		return item;
	},

	bases: [
		{
			name: 'Shortsword',
			stat: ['str','dex'],
			damage: 'slashing',
			type: TYPE_ONEHANDED,
			multiplier: 1,
			material: 'metal'
		},
		{
			name: 'Longsword',
			stat: ['str','dex'],
			damage: 'slashing',
			type: TYPE_ONEHANDED,
			multiplier: 1.2,
			material: 'metal'
		},
		{
			name: 'Greatsword',
			stat: ['str','dex'],
			damage: 'slashing',
			type: TYPE_TWOHANDED,
			multiplier: 1.8,
			material: 'metal'
		},
		{
			name: 'Warhammer',
			stat: ['str'],
			damage: 'bludgeoning',
			type: TYPE_TWOHANDED,
			multiplier: 2,
			material: 'metal'
		},
		{
			name: 'Spear',
			stat: ['str','dex'],
			damage: 'piercing',
			type: TYPE_TWOHANDED,
			multiplier: 1.6,
			material: 'metal'
		},
		{
			name: 'Dagger',
			stat: ['dex'],
			damage: 'piercing',
			type: TYPE_THROWN,
			multiplier: 0.7,
			material: 'metal'
		},
		{
			name: 'Rapier',
			stat: ['dex'],
			damage: 'piercing',
			type: TYPE_ONEHANDED,
			multiplier: 1.1,
			material: 'metal'
		},
		{
			name: 'Mace',
			stat: ['str'],
			damage: 'bludgeoning',
			type: TYPE_ONEHANDED,
			multiplier: 1.2,
			material: 'metal'
		},
		{
			name: 'Spellbook',
			stat: ['int'],
			type: TYPE_MAGIC,
			multiplier: 2,
			material: 'magic'
		},
		{
			name: 'Staff',
			stat: ['wis'],
			type: TYPE_MAGIC,
			multiplier: 2,
			material: 'magic'
		},
		{
			name: 'Symbol',
			stat: ['cha'],
			type: TYPE_MAGIC,
			multiplier: 2,
			material: 'magic'
		},
		{
			name: 'Crossbow',
			stat: ['dex'],
			type: TYPE_RANGED,
			damage: 'piercing',
			multiplier: 1.6,
			material: 'wood'
		},
		{
			name: 'Longbow',
			stat: ['dex'],
			type: TYPE_RANGED,
			damage: 'piercing',
			multiplier: 2,
			material: 'wood'
		},
		{
			name: 'Shortbow',
			stat: ['dex'],
			type: TYPE_RANGED,
			damage: 'piercing',
			multiplier: 1.4,
			material: 'wood'
		},
		{
			name: 'Javelin',
			stat: ['str'],
			type: TYPE_THROWN,
			damage: 'piercing',
			multiplier: 0.8,
			material: 'metal'
		}
	],
	prefixes: [
		{
			name: 'Ancient ',
			damage: 0.5,
			value: 2,
			abundance: 1,
			types: [TYPE_ONEHANDED, TYPE_RANGED, TYPE_THROWN, TYPE_TWOHANDED]
		},
		{
			name: 'Ancient ',
			damage: 1.3,
			value: 2.5,
			abundance: 1,
			types: [TYPE_MAGIC]
		},
		{
			name: 'Rusty ',
			damage: 0.5,
			value: 0.5,
			abundance: 10,
			types: [TYPE_ONEHANDED, TYPE_THROWN, TYPE_TWOHANDED]
		},
		{
			name: 'Jagged ',
			damage: 1.2,
			value: 1.2,
			abundance: 3,
			types: [TYPE_ONEHANDED, TYPE_THROWN, TYPE_TWOHANDED]
		},
		{
			name: 'Crooked ',
			damage: 0.7,
			value: 0.7,
			abundance: 7,
			types: [TYPE_ONEHANDED, TYPE_THROWN, TYPE_TWOHANDED, TYPE_RANGED, TYPE_MAGIC]
		},
		{
			name: 'Sharp ',
			damage: 1.2,
			value: 1.1,
			abundance: 5,
			types: [TYPE_ONEHANDED, TYPE_THROWN, TYPE_TWOHANDED]
		},
		{
			name: 'Fierce ',
			damage: 1.3,
			value: 1,
			abundance: 5,
			types: [TYPE_ONEHANDED, TYPE_TWOHANDED, TYPE_RANGED, TYPE_THROWN, TYPE_MAGIC]
		},
		{
			name: 'Godly ',
			damage: 1.6,
			value: 1.5,
			abundance: 1,
			types: [TYPE_ONEHANDED, TYPE_TWOHANDED, TYPE_RANGED, TYPE_THROWN, TYPE_MAGIC]
		},
		{
			name: 'Demonic ',
			damage: 1.4,
			value: 1.4,
			abundance: 2,
			types: [TYPE_ONEHANDED, TYPE_TWOHANDED, TYPE_RANGED, TYPE_THROWN, TYPE_MAGIC]
		},
		{
			name: 'Weightless ',
			damage: 0.7,
			value: 1.2,
			abundance: 2,
			types: [TYPE_TWOHANDED],
			overrideType: TYPE_ONEHANDED
		},
		{
			name: 'Inert ',
			damage: 0.2,
			value: 0.1,
			abundance: 10,
			types: [TYPE_MAGIC]
		},
		{
			name: 'Oversized ',
			damage: 2.5,
			value: 1.2,
			abundance: 2,
			types: [TYPE_ONEHANDED, TYPE_THROWN],
			overrideType: TYPE_TWOHANDED
		},
		{
			name: 'Shoddy ',
			damage: 0.6,
			value: 0.7,
			abundance: 10,
			types: [TYPE_ONEHANDED, TYPE_TWOHANDED, TYPE_THROWN, TYPE_MAGIC, TYPE_RANGED]
		},
		{
			name: 'Accurate ',
			damage: 1.3,
			value: 1.3,
			abundance: 5,
			types: [TYPE_RANGED, TYPE_THROWN]
		},
		{
			name: 'Broken ',
			damage: 0.4,
			value: 0.3,
			abundance: 7,
			types: [TYPE_RANGED, TYPE_THROWN, TYPE_ONEHANDED, TYPE_TWOHANDED, TYPE_MAGIC]
		}
	],
	suffixes: [
		{
			name: ' of Fire',
			damage: 1.2,
			value: 1.4,
			abundance: 4,
			overrideDamage: 'fire'
		},
		{
			name: ' of Ice',
			damage: 1,
			value: 1.3,
			abundance: 7,
			overrideDamage: 'cold'
		},
		{
			name: ' of Lightning',
			damage: 1.3,
			value: 1.5,
			abundance: 4,
			overrideDamage: 'lightning'
		},
		{
			name: ' of Light',
			damage: 1.5,
			value: 2,
			abundance: 1,
			overrideDamage: 'radiant'
		},
		{
			name: ' of Dark',
			damage: 1.5,
			value: 2,
			abundance: 1,
			overrideDamage: 'necrotic'
		},
		{
			name: ' of Earth',
			damage: 1.2,
			value: 1.3,
			abundance: 6,
			overrideDamage: 'bludgeoning'
		},
		{
			name: ' of Thorns',
			damage: 1.1,
			value: 1.2,
			abundance: 7,
			overrideDamage: 'piercing'
		}
	],
	materials: {
		metals:	[
			{
				name: "Iron ",
				damage: 1,
				abundance: 64,
				value: 1
			},
			{
				name: "Steel ",
				damage: 2,
				abundance: 16,
				value: 5
			},
			{
				name: "Orichalcum ",
				damage: 4,
				abundance: 4,
				value: 35
			},
			{
				name: "Adamantite ",
				damage: 8,
				abundance: 1,
				value: 300
			}
		],
		woods: [
			{
				name: "Oak ",
				damage:1,
				abundance: 64,
				value: 1
			},
			{
				name: 'Carved ',
				damage: 2,
				abundance: 16,
				value: 5
			},
			{
				name: 'Ornate ',
				damage: 4,
				abundance: 4,
				value: 35
			},
			{
				name: 'Master crafted ',
				damage: 8,
				abundance: 1,
				value: 300
			}
		],
		magic: [
			{
				name: 'Common ',
				damage: 1,
				abundance: 64,
				value: 1
			},
			{
				name: 'Rare ',
				damage: 2,
				abundance: 16,
				value: 5
			},
			{
				name: 'Epic ',
				damage: 4,
				abundance: 4,
				value: 35
			},
			{
				name: 'Legendary ',
				damage: 8,
				abundance: 1,
				value: 35
			}
		]
	}
}