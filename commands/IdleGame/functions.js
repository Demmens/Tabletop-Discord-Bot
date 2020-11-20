const f = require(`../../functions.js`);
const fs = require('fs');
module.exports = {

	//Create list of items for use as an embed description
	createItemList: function(arr){
		let arrStr = '';
		let x = 0;
		for (let i of arr){
			arrStr += `${x} - ${i.name}`
		}
		return arrStr;
	},

	retrieveStats: function(){
		return JSON.parse(fs.readFileSync('IdleGame/stats.json'));
	},

	writeStats: function(players){
		fs.writeFileSync('IdleGame/stats.json', JSON.stringify(players, null, 2));
	},

	getStatFromString: function(str, cultist){
		let stat;
		if (str == 'str') stat = cultist.stats.str;
		if (str == 'dex') stat = cultist.stats.dex;
		if (str == 'con') stat = cultist.stats.con;
		if (str == 'int') stat = cultist.stats.int;
		if (str == 'wis') stat = cultist.stats.wis;
		if (str == 'cha') stat = cultist.stats.cha;
		if (!stat) return console.log('ERROR: Could not find stat '+str);
		return stat;
	},

	//Determine attack strength
	calcAttackBonus: function(cultist){
		let ab = 0;

		for (let wep of cultist.equipment.weapons){

			let highestStat=0;
			for (let st of wep.stat){
				let stat = getStatFromString(st);
				if (stat > highestStat) highestStat = stat;
			}

			ab += highestStat+(wep.damage/2); //Change this damage calc later.
		}

		return ab;
	},

	//Create player
	createPlayer: function(ply, name) {
		let d = new Date();
		let curDate = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
		let newPly = {
			name: ply.toString(),
			cultname: name,
			money: 0,
			sacrifices: 0,
			research: 0,
			offerMultiplier: 1,
			sacrificeMultiplier: 1,
			sacSpeed: 1,
			sacrificeMax: 10,
			dailyMultiplier: 1,
			partySize: 1,
			party: [],
			maxCultists: 2,
			startDate: curDate,
			lastUsed: 0,
			cultSacMult: 1,
			cultResMult: 1,
			cultExplMult: 1,
			maxSacrificers: 1,
			maxResearchers: 1,
			upgrades: {
				repeatable: [],
				oneTime: [],
			},
			items:{
				weapons: [],
				armour: [],
				misc: []
			},
			cultists: []
		};

		return newPly;
	},

	//Using normal distribution, vary stats by ~2-4 either side of the average.
	rollStat: function(av){
		let roll = f.randn_bm();
		roll *= 2;
		roll += av;
		if (roll < 1){
			roll = 1;
		}
		roll = Math.floor(roll);
		return roll;
	},

	skillCheck: function(stat){
		let roll = f.randn.bm();
		roll *= 10;
		roll += (10+stat);
		if (roll < 1){
			roll = 1;
		}
		roll = Math.floor(roll);
		return roll;
	},

	createCultistStatString: function(cultist){
		let trStr = '**Traits:**\n';
		for (let tr of cultist.traits){
			trStr += `- ${tr.name}: ${tr.description}\n`;
		}
		let st = cultist.stats;
		return `Str: ${st.str}\nDex: ${st.dex}\nCon: ${st.con}\nInt: ${st.int}\nWis: ${st.wis}\nCha: ${st.cha}\nJob: ${cultist.job}\n${trStr}`;
	},

	//Create a cultist
	CreateCultist: function() {
		const jsonString = fs.readFileSync('IdleGame/names.json');
		const names = JSON.parse(jsonString);
		const strVal = 1.1; //|
		const dexVal = 1.1; //|
		const conVal = 1.2; //| Variables for how much each stat is worth
		const intVal = 1;   //| (some stats will be better than others) 
		const wisVal = 1;   //|
		const chaVal = 1;   //|


		const minCost = 5; // Min cost for cultists
		let cultist = {};

		let forename = names.cultist.forenames[Math.floor(Math.random()*names.cultist.forenames.length)]
		let surname = names.cultist.surnames[Math.floor(Math.random()*names.cultist.surnames.length)]

		cultist.name = `${forename} The ${surname}`;
		cultist.id = names.cultist.id; //Take the id from the names list, so we make sure no cultists will ever share the same ID.
		names.cultist.id++ //Increase id by 1 for the next cultists so no two cultists share an ID.

		let numTraits = Math.ceil(f.randn_bm()); //Calculate how many traits the cultist has
		if (numTraits < 1) numTraits = 1; //Make sure each cultist has at least one trait.

		let traitTbl = [];
		for (let i=0;i<numTraits;i++){
			let hastr = true;
			let tr;
			while(hastr){ //Loop until we don't get a duplicate trait. Theoretically this could cause a problem, but it's so insanely unlikely it's not worth considering.
				tr = f.arrRandom(names.cultist.traits);
				for (let j of traitTbl){
					if (j.name == tr.name){
						hastr = true;
						break; //by breaking here, we skip setting hastr to false, so we randomise a new trait without inserting into array.
					}
					hastr = false;
				}
				if (traitTbl.length == 0) hastr = false;
			}	
			traitTbl.push(tr); //Fill the array with random unique traits
		}
		cultist.traits = traitTbl;

		cultist.level = 1;
		cultist.stats = {};
		let st = cultist.stats;
		let dice = f.lowest(12,3)+2 //Create random mean for all the stats, so we have both cheap and expensive cultists on average. Roll 3 and take lowest, to favour new players
		st.str = this.rollStat(dice,2); //Roll stats for cultist using normal distribution so statblocks feel more consistent, but still have varying stats.
		st.dex = this.rollStat(dice,2);
		st.con = this.rollStat(dice,2);
		st.int = this.rollStat(dice,2);
		st.wis = this.rollStat(dice,2);
		st.cha = this.rollStat(dice,2);

		let trVal = 1;
		const negTrMin = 0; //For messing with the maths
		const negTrMult = 0.5;
		const posTrPl = 2;
		const posTrMult = 1.2;
		for (let tr of traitTbl){ //Unfortunately the only way to do this without recoding everything is manually
			if (tr.name == 'Timid') st.str = Math.ceil((st.str- negTrMin)*negTrMult);
			if (tr.name == 'Clumsy') st.dex = Math.ceil((st.dex-negTrMin)*negTrMult); 
			if (tr.name == 'Sickly') st.con = Math.ceil((st.con-negTrMin)*negTrMult);
			if (tr.name == 'Naive') st.wis = Math.ceil((st.wis-negTrMin)*negTrMult);
			if (tr.name == 'Thug') st.int = Math.ceil((st.int-negTrMin)*negTrMult);
			if (tr.name == 'Introvert') st.cha = Math.ceil((st.cha-negTrMin)*negTrMult);
			if (tr.name == 'Swole') st.str = Math.ceil((posTrPl + st.str)*posTrMult);
			if (tr.name == 'Sly') st.dex = Math.ceil(posTrPl + st.dex*posTrMult);
			if (tr.name == 'Health Nut') st.con = Math.ceil(posTrPl + st.con*posTrMult);
			if (tr.name == 'Ancient') st.wis = Math.ceil(posTrPl + st.wis*posTrMult);
			if (tr.name == 'Scholar') st.int = Math.ceil(posTrPl + st.int*posTrMult);
			if (tr.name == 'Extrovert') st.cha = Math.ceil(posTrPl + st.cha*posTrMult);
			trVal *= tr.value;
		}

		let pow = 100000000;//| These two variables control costs of stats.
		let coeff = 0.05;   //|
		let coeff2 = 100; //Multiply final cost by this variable. Controls overall expense of cultists.
		cultist.value = strVal*Math.pow(pow,st.str*coeff); //Want high stats to exponentially scale cost of cultist.
		cultist.value += dexVal*Math.pow(pow,st.dex*coeff);
		cultist.value += conVal*Math.pow(pow,st.con*coeff);
		cultist.value += intVal*Math.pow(pow,st.int*coeff);
		cultist.value += wisVal*Math.pow(pow,st.wis*coeff);
		cultist.value += chaVal*Math.pow(pow,st.cha*coeff);
		cultist.value = trVal*coeff2*Math.floor(cultist.value*((Math.random()*0.2) + 0.9)); //Add a bit of randomness
		cultist.value = Math.floor(cultist.value/1000)*1000; //Make it a nice round number cost.
		if (cultist.value <= minCost){
			cultist.value = minCost;
		}
		cultist.hp = st.con;
		cultist.job = 'none';
		cultist.equipment = {
			armour: {
				head: {
					name: 'none'
				},
				body: {
					name: 'none'
				},
				legs: {
					name: 'none'
				},
				hands: {
					name: 'none'
				},
				feet: {
					name: 'none'
				}
			},
			weapons: [
			{
				name: 'none'
			},
			{
				name: 'none'
			}
			],
			items: []
		}
		cultist.lastAction = Date.now();

		let writeJsonString = JSON.stringify(names, null, 4);
		fs.writeFileSync('IdleGame/names.json', writeJsonString);

		return cultist;
	}
}