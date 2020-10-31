const f = require(`../../functions.js`);
const fs = require('fs');
module.exports = {

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
	createCultistStatString: function(cultist){
		let st = cultist.stats;
		return `Str: ${st.str}\nDex: ${st.dex}\nCon: ${st.con}\nInt: ${st.int}\nWis: ${st.wis}\nCha: ${st.cha}`;
	},

	//Create a cultist
	CreateCultist: function() {
		try {
			const jsonString = fs.readFileSync('IdleGame/names.json');
			const names = JSON.parse(jsonString);
			const strVal = 1; //|
			const dexVal = 1; //|
			const conVal = 1; //| Variables for how much each stat is worth
			const intVal = 1; //| (some stats will be better than others) 
			const wisVal = 1; //|
			const chaVal = 1; //|

			const minCost = 5; //Min cost for cultists
			let cultist = [];

			let forename = names.cultist.forenames[Math.floor(Math.random()*names.cultist.forenames.length)]
			let surname = names.cultist.surnames[Math.floor(Math.random()*names.cultist.surnames.length)]

			cultist.name = `${forename} The ${surname}`;
			cultist.id = names.cultist.id; //Take the id from the names list, so we make sure no cultists will ever share the same ID.
			names.cultist.id++ //Increase ID by 1 for the next cultist. This /could/ be a problem if too many cultists are made, but for our purposes it's fine.
			cultist.level = 1;
			cultist.stats = [];
			let st = cultist.stats;
			let dice = f.lowest(12,3)+2 //Create random mean for all the stats, so we have both cheap and expensive cultists on average. Roll 3 and take lowest, to favour new players
			st.str = this.rollStat(dice,2); //Roll stats for cultist using normal distribution so statblocks feel more consistent, but still have varying stats.
			st.dex = this.rollStat(dice,2);
			st.con = this.rollStat(dice,2);
			st.int = this.rollStat(dice,2);
			st.wis = this.rollStat(dice,2);
			st.cha = this.rollStat(dice,2);

			let pow = 100000000;//| These 2 variables control the costs.
			let coeff = 0.05;  //|
			let coeff2 = 100; //Multiply the final cost by this variable. Controls the overall expense of cultists.
			cultist.value = strVal*Math.pow(pow,st.str*coeff); //Want high stats to exponentially scale the cost of the cultist.
			cultist.value += dexVal*Math.pow(pow,st.dex*coeff);
			cultist.value += conVal*Math.pow(pow,st.con*coeff);
			cultist.value += intVal*Math.pow(pow,st.int*coeff);
			cultist.value += wisVal*Math.pow(pow,st.wis*coeff);
			cultist.value += chaVal*Math.pow(pow,st.cha*coeff);
			cultist.value = coeff2*Math.floor(cultist.value*((Math.random()*0.2) + 0.9)); //Add a bit of randomness
			cultist.value = Math.floor(cultist.value/1000)*1000; //Make it a nice round number cost.
			if (cultist.value <= minCost){
				cultist.value = minCost;
			}
			cultist.hp = st.con;

			let writeJsonString = JSON.stringify(names, null, 4);
			fs.writeFileSync('IdleGame/names.json', writeJsonString);

			return cultist;

		} catch(err){
			console.log('Error parsing JSON string:', err)
		}
	}
}