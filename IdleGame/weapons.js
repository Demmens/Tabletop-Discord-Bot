//Weapon Types
const TYPE_ONEHANDED = 'One Handed';
const TYPE_TWOHANDED = 'Two Handed';
const TYPE_THROWN = 'Thrown';
const TYPE_MAGIC = 'Magic';
const TYPE_RANGED = 'Ranged';
const f = require('../functions.js')


module.exports = {

//This is probably a terrible way of randomising with different weights, but I can't think of anything better rn.
	randomisePrefix: function(base){
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
		return prefixTbl[num];
	},

	randomiseSuffix: function(base){
		let suffixTbl = [];
		for (let i of this.suffixes){
			for (let j=0; j<i.abundance; j++){
				suffixTbl.push(i); //Create table so we can give the correct probabilities
			}
		}
		num = Math.floor(Math.random()*suffixTbl.length);
		return suffixTbl[num];
	},

	randomiseMaterial: function(base){
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
		return materialTbl[num];
	},

	generateItem: function(id,base,material,prefix,suffix){
		let item = {};
		item.damage = base.multiplier*material.damage;
		item.value = material.value*base.multiplier;
		item.dmgType = base.damage;
		item.type = base.type;
		item.stat = base.stat;
		item.name = '';
		item.id = id;
		item.base = base.id;

		if (prefix){
			item.prefix = prefix.id;
			item.name += prefix.name;
			item.damage *= prefix.damage;
			item.value *= prefix.value;
			if (prefix.overrideType) item.type = prefix.overrideType;	
		}

		item.name += ' ' + material.name + ' ' + base.name;


		if (suffix){
			item.suffix = suffix.id;
			item.name += ' of '+suffix.name;
			if (suffix.overrideDamage) item.dmgType = suffix.overrideDamage;
			item.damage *= suffix.damage;
			item.value *= suffix.value;
		}

		item.value = Math.floor(item.value*20)*5000;
		item.damage = Math.floor(item.damage*10);
		return item;
	},

	randomiseBase: function(){
		let base = {id:0};
		while (base.id <= 0) base = f.arrRandom(this.bases);
		return base;
	},

	generateRandomItem: function(id,guaranteePrefix, guaranteeSuffix){
		let prefixChance = 0.35 //Change to balance
		let suffixChance = 0.1

		if (guaranteePrefix) prefixChance = 1;
		if (guaranteeSuffix) suffixChance = 1;
		let base = this.randomiseBase();

		if (base.type == TYPE_MAGIC) suffixChance = 1; //Magic weapons will always have a suffix

		let prefix;
		let suffix;

		if (Math.random() <= prefixChance){
			prefix = this.randomisePrefix(base);
		}
		if (Math.random() <= suffixChance){
			suffix = this.randomiseSuffix(base);
		}

		const material = this.randomiseMaterial(base);

		return this.generateItem(id,base,material,prefix,suffix);
	},

	bases: [
		{
			id: 0,
			name: 'Fists',
			stat: ['str'],
			damage: 'bludgeoning',
			type: TYPE_ONEHANDED,
			multiplier: 1,
			hitText: [
				"CULTIST throws a punch at ENEMY, clocking them for",
				"CULTIST jabs at ENEMY with their fists, pummelling them for",
				"CULTIST throws a right hook at ENEMY, hitting them for",
			],
			missText: [
				"CULTIST throws a punch at ENEMY, but their swing goes wide.",
				"CULTIST punches ENEMY, but it shrugs off the damage",
				"CULTIST throws a right hook at ENEMY, but the attack is swiftly dodged"
			]
		},
		{
			id: 1,
			name: 'Shortsword',
			stat: ['str','dex'],
			damage: 'slashing',
			type: TYPE_ONEHANDED,
			multiplier: 1,
			material: 'metal',
			hitText: [
				"CULTIST quickly slashes at ENEMY with their shortsword, swiftly slicing it for",
				"CULTIST leaps forward and swings their shortsword at ENEMY, cutting through them for"
			],
			missText: [
				"CULTIST swipes at ENEMY with their shortsword, but their swing goes wide.",
				"CULTIST slashes at ENEMY with their shortsword, but it swiftly dodges the attack."
			]
		},
		{
			id: 2,
			name: 'Longsword',
			stat: ['str','dex'],
			damage: 'slashing',
			type: TYPE_ONEHANDED,
			multiplier: 1.2,
			material: 'metal',
			hitText: [
				"CULTIST slashes at ENEMY with their longsword, slicing it for",
				"CULTIST leaps forward and swings their longsword at ENEMY, cutting it for"
			],
			missText: [
				"CULTIST swipes at ENEMYwith their longsword, but their swing goes wide.",
				"CULTIST slashes at ENEMY with their longsword, but it swiftly dodges the attack."
			]
		},
		{
			id: 3,
			name: 'Greatsword',
			stat: ['str','dex'],
			damage: 'slashing',
			type: TYPE_TWOHANDED,
			multiplier: 1.8,
			material: 'metal',
			hitText: [
				"CULTIST brings their greatsword down on ENEMY, dealing",
				"CULTIST swings their greatsword around, cutting into ENEMY for"
			],
			missText: [
				"CULTIST brings their greatsword down, but ENEMY dodges out of the way.",
				"CULTIST sweeps their greatsword at ENEMY, but it narrowly misses."
			]
		},
		{
			id: 4,
			name: 'Warhammer',
			stat: ['str'],
			damage: 'bludgeoning',
			type: TYPE_TWOHANDED,
			multiplier: 2,
			material: 'metal',
			hitText: [
				"CULTIST brings their warhammer down on ENEMY, crushing them for",
				"ENEMY is crushed by CULTIST's warhammer, taking"
			],
			missText: [
				"CULTIST smashes their warhammer into the ground, narrowly missing ENEMY",
				"CULTIST swings their warhammer at ENEMY, but it switfly dodges the attack."
			]
		},
		{
			id: 5,
			name: 'Spear',
			stat: ['str','dex'],
			damage: 'piercing',
			type: TYPE_TWOHANDED,
			multiplier: 1.6,
			material: 'metal',
			hitText: [
				"CULTIST thrusts their spear at ENEMY, spiking them for",
				"CULTIST lunges at ENEMY, spearing them for",
				"CULTIST skewers ENEMY with their spear for"
			],
			missText: [
				"CULTIST thrusts at ENEMY with their spear, but misses.",
				"CULTIST lunges at ENEMY with their spear, but they quickly dodge the attack."
			]
		},
		{
			id: 6,
			name: 'Dagger',
			stat: ['dex'],
			damage: 'piercing',
			type: TYPE_THROWN,
			multiplier: 0.7,
			material: 'metal',
			hitText: [
				"CULTIST throws a dagger at ENEMY, directly hitting them for",
				"CULTIST swiftly lets loose a dagger from their hand, piercing ENEMY for"
			],
			missText: [
				"CULTIST throws a dagger towards ENEMY, but it narrowly misses.",
				"CULTIST lets loose a dagger from their hand, but ENEMY dodges the attack."
			]
		},
		{
			id: 7,
			name: 'Rapier',
			stat: ['dex'],
			damage: 'piercing',
			type: TYPE_ONEHANDED,
			multiplier: 1.1,
			material: 'metal',
			hitText: [
				"CULTIST lunges at ENEMY with their rapier, stabbing them for",
				"CULTIST dodges an attack by ENEMY, then quickly ripostes for"
			],
			missText: [
				"CULTIST thrusts at ENEMY with their rapier, but the attack is blocked.",
				"CULTIST lunges at ENEMY with their rapier, but is parried."
			]
		},
		{
			id: 8,
			name: 'Mace',
			stat: ['str'],
			damage: 'bludgeoning',
			type: TYPE_ONEHANDED,
			multiplier: 1.2,
			material: 'metal',
			hitText: [
				"CULTIST slams their mace into ENEMY, dealing",
				"CULTIST swings their mace at ENEMY, smacking them for"
			],
			missText: [
				"CULTIST swings their mace at ENEMY, but misses.",
				"CULTIST brings their mace down on ENEMY, but the attack is swiftly dodged."
			]
		},
		{
			id: 9,
			name: 'Spellbook',
			stat: ['int'],
			type: TYPE_MAGIC,
			multiplier: 2,
			material: 'magic'
		},
		{
			id: 10,
			name: 'Staff',
			stat: ['wis'],
			type: TYPE_MAGIC,
			multiplier: 2,
			material: 'magic'
		},
		{
			id: 11,
			name: 'Symbol',
			stat: ['cha'],
			type: TYPE_MAGIC,
			multiplier: 2,
			material: 'magic'
		},
		{
			id: 12,
			name: 'Crossbow',
			stat: ['dex'],
			type: TYPE_RANGED,
			damage: 'piercing',
			multiplier: 1.6,
			material: 'wood',
			hitText: [
				"CULTIST lets loose a bolt at ENEMY, directly hitting them for",
				"CULTIST aims and fires a bolt at ENEMY. The bolt flies and hits them cleanly for"
			],
			missText: [
				"CULTIST lets loose a bolt at ENEMY, but the shot goes wide.",
				"CULTIST aims and fires a bolt at ENEMY, but they swiftly dodge the attack."
			]
		},
		{
			id: 13,
			name: 'Longbow',
			stat: ['dex'],
			type: TYPE_RANGED,
			damage: 'piercing',
			multiplier: 2,
			material: 'wood',
			hitText: [
				"CULTIST holds their longbow up and looses an arrow, landing a clean shot on ENEMY for",
				"CULTIST aims their longbow and fires an arrow, directly hitting ENEMY for"
			],
			missText:[
				"CULTIST looses an arrow at ENEMY, but the shot goes wide.",
				"CULTIST aims and fires their longbow at ENEMY, but the arrow clatters to the ground."
			]
		},
		{
			id: 14,
			name: 'Shortbow',
			stat: ['dex'],
			type: TYPE_RANGED,
			damage: 'piercing',
			multiplier: 1.4,
			material: 'wood',
			hitText: [
				"CULTIST knocks and looses an arrow from their shortbow, cleanly shooting ENEMY for",
				"CULTIST draws and fires an arrow at ENEMY from their shortbow, directly hitting them for"
			],
			missText: [
				"CULTIST knocks and looses an arrow at ENEMY from their shortbow, but the shot goes wide.",
				"CULTIST draws and fires an arrow at ENEMY from their shortbow, but the arrow is quickly dodged."
			]
		},
		{
			id: 15,
			name: 'Javelin',
			stat: ['str'],
			type: TYPE_THROWN,
			damage: 'piercing',
			multiplier: 0.8,
			material: 'metal',
			hitText: [
				"CULTIST launches their javelin towards ENEMY, directly spearing them for",
				"CULTIST hurls a javelin at ENEMY, cleanly skewering them for"
			],
			missText: [
				"CULTIST launches their javelin towards ENEMY, but it sticks in the ground right next to them",
				"CULTIST hurls a javelin at ENEMY, but they swiftly dodge."
			]
		},
		{
			id: 16,
			name: 'Greataxe',
			stat: ['str'],
			type: TYPE_TWOHANDED,
			damage: 'slashing',
			multiplier: 2.1,
			material: 'metal',
			hitText: [
				"CULTIST slams their greataxe down into ENEMY, cleaving them for",
				"CULTIST sweeps wildly at ENEMY with their greataxe, lacerating them for"
			],
			missText: [
				"CULTIST slams their greataxe down at ENEMY, but the attack is swiftly dodged",
				"CULTIST sweeps wildly at ENEMY with their greataxe, but they dodge the attack."
			]
		},
		{
			id: 17,
			name: 'Battleaxe',
			stat: ['str'],
			type: TYPE_ONEHANDED,
			damage: 'slashing',
			multiplier: 1.15,
			material: 'metal',
			hitText: [
				"CULTIST slashes at ENEMY with their battleaxe, cleaving them for",
				"CULTIST hacks away at ENEMY with their battleaxe, goring them for"
			],
			missText: [
				"CULTIST slashes at ENEMY with their battleaxe, but the attack is dodged.",
				"CULTIST hacks away at ENEMY with their battleaxe, but they swiftly dodge the attack."
			]
		}
	],
	prefixes: [
		{
			id: 1,
			name: 'Ancient',
			damage: 0.5,
			value: 2,
			abundance: 1,
			types: [TYPE_ONEHANDED, TYPE_RANGED, TYPE_THROWN, TYPE_TWOHANDED]
		},
		{
			id: 2,
			name: 'Ancient',
			damage: 1.3,
			value: 2.5,
			abundance: 1,
			types: [TYPE_MAGIC]
		},
		{
			id: 3,
			name: 'Rusty',
			damage: 0.5,
			value: 0.5,
			abundance: 10,
			types: [TYPE_ONEHANDED, TYPE_THROWN, TYPE_TWOHANDED]
		},
		{
			id: 4,
			name: 'Jagged',
			damage: 1.2,
			value: 1.2,
			abundance: 3,
			types: [TYPE_ONEHANDED, TYPE_THROWN, TYPE_TWOHANDED]
		},
		{
			id: 5,
			name: 'Crooked',
			damage: 0.7,
			value: 0.7,
			abundance: 7,
			types: [TYPE_ONEHANDED, TYPE_THROWN, TYPE_TWOHANDED, TYPE_RANGED, TYPE_MAGIC]
		},
		{
			id: 6,
			name: 'Sharp',
			damage: 1.2,
			value: 1.1,
			abundance: 5,
			types: [TYPE_ONEHANDED, TYPE_THROWN, TYPE_TWOHANDED]
		},
		{
			id: 7,
			name: 'Fierce',
			damage: 1.3,
			value: 1,
			abundance: 5,
			types: [TYPE_ONEHANDED, TYPE_TWOHANDED, TYPE_RANGED, TYPE_THROWN, TYPE_MAGIC]
		},
		{
			id: 8,
			name: 'Godly',
			damage: 1.6,
			value: 1.5,
			abundance: 1,
			types: [TYPE_ONEHANDED, TYPE_TWOHANDED, TYPE_RANGED, TYPE_THROWN, TYPE_MAGIC]
		},
		{
			id: 9,
			name: 'Demonic',
			damage: 1.4,
			value: 1.4,
			abundance: 2,
			types: [TYPE_ONEHANDED, TYPE_TWOHANDED, TYPE_RANGED, TYPE_THROWN, TYPE_MAGIC]
		},
		{
			id: 10,
			name: 'Weightless',
			damage: 0.7,
			value: 1.2,
			abundance: 2,
			types: [TYPE_TWOHANDED],
			overrideType: TYPE_ONEHANDED
		},
		{
			id: 11,
			name: 'Inert',
			damage: 0.2,
			value: 0.1,
			abundance: 10,
			types: [TYPE_MAGIC]
		},
		{
			id: 12,
			name: 'Oversized',
			damage: 2.5,
			value: 1.2,
			abundance: 2,
			types: [TYPE_ONEHANDED, TYPE_THROWN],
			overrideType: TYPE_TWOHANDED
		},
		{
			id: 13,
			name: 'Shoddy',
			damage: 0.6,
			value: 0.7,
			abundance: 10,
			types: [TYPE_ONEHANDED, TYPE_TWOHANDED, TYPE_THROWN, TYPE_MAGIC, TYPE_RANGED]
		},
		{
			id: 14,
			name: 'Accurate',
			damage: 1.3,
			value: 1.3,
			abundance: 5,
			types: [TYPE_RANGED, TYPE_THROWN]
		},
		{
			id: 15,
			name: 'Broken',
			damage: 0.4,
			value: 0.3,
			abundance: 7,
			types: [TYPE_RANGED, TYPE_THROWN, TYPE_ONEHANDED, TYPE_TWOHANDED, TYPE_MAGIC]
		}
	],
	suffixes: [
		{
			id: 1,
			name: 'Fire',
			damage: 1.2,
			value: 1.4,
			abundance: 4,
			overrideDamage: 'fire',
			hitText: [
				"CULTIST raises their ITEM and a searing ray of fire bursts forth at ENEMY, burning them for",
				"CULTIST chants under their breath and a large ball of fire launches at ENEMY, searing them for",
				"CULTIST's eyes glow a deep red, and the ground underneath ENEMY erupts with a geyser of fire, scorching them for"
			]
		},
		{
			id: 2,
			name: 'Ice',
			damage: 1,
			value: 1.3,
			abundance: 7,
			overrideDamage: 'cold',
			hitText: [
				"CULTIST raises their ITEM and a bright blue light bursts forth at ENEMY, scorching them with frost for",
				"CULTIST's eyes glow a bright blue, and a large ice spike bursts from the ground underneath ENEMY, dealing",
				"CULTIST chants under their breath and the air around ENEMY turns to searing frost, burning them for"
			]
		},
		{
			id: 3,
			name: 'Lightning',
			damage: 1.3,
			value: 1.5,
			abundance: 4,
			overrideDamage: 'lightning',
			hitText: [
				"CULTIST chants under their breath, and a burst of demonic lightning forks forward into ENEMY, dealing",
				"CULTIST raises their ITEM and a burning ball of electricity fires forward into ENEMY for",
				"CULTIST's eyes glow a bright yellow, and the ground beneath ENEMY erupts with crackling lightning, scorching them for"
			]
		},
		{
			id: 4,
			name: 'Light',
			damage: 1.5,
			value: 2,
			abundance: 1,
			overrideDamage: 'radiant',
			hitText: [
				"CULTIST raises their ITEM and a beam of brilliant light shoots into ENEMY, blinding them for",
				"CULTIST's eyes glow a burning white, and an arrow of angelic light shoots forth into ENEMY for",
				"CULTIST chants under their breath, and a beam of scorching light strikes ENEMY from the heavens, dealing"
			]
		},
		{
			id: 5,
			name: 'Dark',
			damage: 1.5,
			value: 2,
			abundance: 1,
			overrideDamage: 'necrotic',
			hitText: [
				"CULTIST's eyes turn pitch black, and multiple shadowy tenticles surround and pummel ENEMY for",
				"CULTIST chants under their breath, and the energy from ENEMY seems to drain and wither, dealing",
				"CULTIST raises their ITEM and a shadowy beam of death shoots into ENEMY, draining them for"
			]
		},
		{
			id: 6,
			name: 'Earth',
			damage: 1.2,
			value: 1.3,
			abundance: 6,
			overrideDamage: 'bludgeoning',
			hitText: [
				"CULTIST's eyes glow a deep green, and many boulders raise around them, firing into ENEMY for",
				"CULTIST raises their ITEM and a boulder manifests infront of them, launching at ENEMY and dealing",
				"CULTIST chants under their breath, and the ground underneath ENEMY erupts into shards of stone, dealing"
			]
		},
		{
			id: 7,
			name: 'Thorns',
			damage: 1.1,
			value: 1.2,
			abundance: 7,
			overrideDamage: 'piercing',
			hitText: [
				"CULTIST chants under their breath, and multiple thorny vines burst from the ground around ENEMY, lacerating them for",
				"CULTIST raises their ITEM and they become surrounded by thorns, which all shoot towards ENEMY, stabbing them for"
			]
		}
	],
	materials: {
		metals:	[
			{
				name: "Iron",
				damage: 1,
				abundance: 64,
				value: 1
			},
			{
				name: "Steel",
				damage: 2,
				abundance: 16,
				value: 5
			},
			{
				name: "Orichalcum",
				damage: 4,
				abundance: 4,
				value: 35
			},
			{
				name: "Adamantite",
				damage: 8,
				abundance: 1,
				value: 300
			}
		],
		woods: [
			{
				name: "Oak",
				damage:1,
				abundance: 64,
				value: 1
			},
			{
				name: 'Carved',
				damage: 2,
				abundance: 16,
				value: 5
			},
			{
				name: 'Ornate',
				damage: 4,
				abundance: 4,
				value: 35
			},
			{
				name: 'Master Crafted',
				damage: 8,
				abundance: 1,
				value: 300
			}
		],
		magic: [
			{
				name: 'Common',
				damage: 1,
				abundance: 64,
				value: 1
			},
			{
				name: 'Rare',
				damage: 2,
				abundance: 16,
				value: 5
			},
			{
				name: 'Epic',
				damage: 4,
				abundance: 4,
				value: 35
			},
			{
				name: 'Legendary',
				damage: 8,
				abundance: 1,
				value: 300
			}
		]
	}
}