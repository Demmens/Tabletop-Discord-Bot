const fs = require('fs');
const { Client } = require('pg');
var dbURL;
try{
	dbURL = require('./token.json').dbURL;
}
catch{
	dbURL = process.env.DATABASE_URL;
}

const DB =  new Client({
	connectionString: dbURL,
	ssl: {
		rejectUnauthorized: false
	}
});

(async function dbConnect() {

	console.log('Connecting to Database from functions...')
	try{
		await DB.connect()
		console.log('\x1b[32m%s\x1b[0m', 'Connection to Database from functions established.')
	} catch(error)
	{
		console.log(error)
	}
}())

module.exports = {
	//|-------------------|\\
	//| General Functions |\\
	//|-------------------|\\

	//Return a random item from an array
	arrRandom: function(arr){
		let num = Math.floor(Math.random()*arr.length);
		return arr[num];
	},

	//Randomise an array
	arrRandomise: function(arr){
		let newArr = [];
		while (arr.length > 0){
			let k = Math.floor(Math.random()*arr.length);
			let v = arr[num];
			arr.splice(k,1)
			newArr.push(v);
		}
		return newArr;
	},

	//Replace hyphens and underscores with spaces
	replaceHyphens: function(str){
		let splt = str.split(/[_|-]/);
		let msg = "";
		for(let i of splt){
			msg += i;
		}
		return msg;
	},

	//Separate thousands by commas in a number
	numberWithCommas: function(x) {
	    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	},

	//Remove array index by value
	removeA: function(arr) {
	    var what, a = arguments, L = a.length, ax;
	    while (L > 1 && arr.length) {
	        what = a[--L];
	        while ((ax= arr.indexOf(what)) !== -1) {
	            arr.splice(ax, 1);
	        }
	    }
	    return arr;
	},

	//|------------------------------------|\\
	//| Random Number Generation Functions |\\
	//|------------------------------------|\\

	//roll dice and return highest result
	highest: function(dice, number){
		let roll = 0;
		let cur = 0;
		for (let i=0;i<number;i++){
			cur = Math.ceil(Math.random()*dice);
			if (cur > roll){
				roll = cur;
			}
		}

		return roll;
	},

	//roll dice and return lowest result
	lowest: function(dice, number){
		let roll = Number.MAX_SAFE_INTEGER;
		let cur = 0;
		for (let i=0;i<number;i++){
			cur = Math.ceil(Math.random()*dice);
			if (cur < roll){
				roll = cur;
			}
		}

		return roll;
	},

	// Standard Normal variate using Box-Muller transform.
	randn_bm: function() {
	    var u = 0, v = 0;
	    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
	    while(v === 0) v = Math.random();
	    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
	},

	//|---------------------|\\
	//| Idle Game Functions |\\
	//|---------------------|\\

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
		let roll = this.randn_bm();
		roll *= 2;
		roll += av;
		if (roll < 1){
			roll = 1;
		}
		roll = Math.floor(roll);
		return roll;
	},

	skillCheck: function(stat){
		let roll = this.randn.bm();
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

		let numTraits = Math.ceil(this.randn_bm()); //Calculate how many traits the cultist has
		if (numTraits < 1) numTraits = 1; //Make sure each cultist has at least one trait.

		let traitTbl = [];
		for (let i=0;i<numTraits;i++){
			let hastr = true;
			let tr;
			while(hastr){ //Loop until we don't get a duplicate trait. Theoretically this could cause a problem, but it's so insanely unlikely it's not worth considering.
				tr = this.arrRandom(names.cultist.traits);
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
		let dice = this.lowest(15,3) //Create random mean for all the stats, so we have both cheap and expensive cultists on average. Roll 3 and take lowest, to favour new players
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

		const pow = 220;  //| These two variables control costs of stats.
		const coeff = 1.9; //|
		const coeff2 = 0.1; //Multiply final cost by this variable. Controls overall expense of cultists.
		const baseCost = 10000 //Minimum possible cost for a cultist
		cultist.value = strVal*Math.pow(st.str*pow,coeff); //Want high stats to exponentially scale cost of cultist.
		cultist.value += dexVal*Math.pow(st.dex*pow,coeff);
		cultist.value += conVal*Math.pow(st.con*pow,coeff);
		cultist.value += intVal*Math.pow(st.int*pow,coeff);
		cultist.value += wisVal*Math.pow(st.wis*pow,coeff);
		cultist.value += chaVal*Math.pow(st.cha*pow,coeff);
		cultist.value = baseCost+(trVal*coeff2*Math.floor(cultist.value*((Math.random()*0.2) + 0.9))); //Add a bit of randomness
		cultist.value = Math.floor(cultist.value/1000)*1000; //Make it a nice round number cost.
		if (cultist.value <= minCost){
			cultist.value = minCost;
		}
		cultist.hp = st.con;
		cultist.job = 'none';
		cultist.equipment = {
			armour: {
				head: {
					name: 'none',
					equip: 'head'
				},
				body: {
					name: 'none',
					equip: 'body'
				},
				legs: {
					name: 'none',
					equip: 'legs'
				},
				hands: {
					name: 'none',
					equip: 'hands'
				},
				feet: {
					name: 'none',
					equip: 'feet'
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

		return cultist;
	},

	//|--------------------|\\
	//| Database Functions |\\
	//|--------------------|\\

	runQuery: function(query){
		(async () => {
			try{
				const res = await client.query(query);
			} catch (err) {
				console.error(err);
			}
		})
	},

	getCult: async function(user){
		const query = `select * from cults where owner_id = ${user.id}`	
		const ply = await DB.query(query);
		if (!ply.rows) return null;
		else return ply.rows[0];
	},

	writeCults: async function(ownerID, field, entry){
		const query = `
		UPDATE cults
		SET ${field} = ${entry}
		WHERE owner_id = ${ownerID}
		`;
		DB.query(query);
	},

	fullWriteCults: async function(ply){
		const query = `
		UPDATE cults
		SET money = ${ply.money},
		sacrifices = ${ply.sacrifices},
		research = ${ply.research},
		offermultiplier = ${ply.offermultiplier},
		sacrificeMultiplier = ${ply.sacrificemultiplier},
		sacrificeSpeedMult = ${ply.sacrificespeedmult},
		sacrificeSpeedAdd = ${ply.sacrificespeedadd},
		sacMult = ${ply.sacmult},
		sacrificeMax = ${ply.sacrificemax},
		dailyMultiplier = ${ply.dailymultiplier},
		partySize = ${ply.partysize},
		maxCultists = ${ply.maxcultists},
		cultSacMult = ${ply.cultsacmult},
		cultResMult = ${ply.cultresmult},
		cultExplMult = ${ply.cultexplmult},
		maxSacrificers = ${ply.maxsacrificers},
		maxResearchers = ${ply.maxresearchers},
		upgrades = '${ply.upgrades}',
		items = '${ply.items}',
		cultists = '${ply.cultists}'
		WHERE owner_id = ${ply.owner_id}
		`;
		/*
		
		*/
		DB.query(query);
	},

	deleteCult: async function(ownerID, name){
		const query = `
		DELETE FROM cults
		WHERE owner_id = ${ownerID}
		`;
		(async() => {
			try{
				const res = await client.query(query);
				console.log('Data deleted successfully');
			} catch(err){
				console.error(err);
			}
		})
	},

}