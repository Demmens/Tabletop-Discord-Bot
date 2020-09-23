const { Command } = require("discord-akairo");

class DiceCommand extends Command {
	constructor() {
		super("dice", {
			args: [{id: "message", type: "string", match: "content"}],
			description: "Rolls dice",
			regex: /^\/\d*d\d*/i
		});
	}
	exec(message, args) {
		let cont = message.content;
		let arr = cont.split(/ |\\|(?<=\D)(?=\d+)|(?<=\d)(?=\D+)/); //split string into an array of numbers and words while deleting spaces.
		let dice; //Dice is the number of sides on the dice		
		let num; //Num is how many dice to roll
		let rolls = [];
		let running = 0;
		let totals = [];

		function hasMod(char, index, arr){
			for (let i = index+1; i<arr.length;i++){
				if (arr[i] =='d'){
					return false;
				}else if (arr[i] == char){
					return i;
				}
			}
			return false;
		}

		arr.forEach(function(char,index,array){ //Loop through characters and find things we need.
			if (char == "d"){ //Main use. Detect when dice are specified.
				//First determine how many dice to roll
				if (index == 0){
					num = 1;
				}
				else{
					num = parseInt(arr[index-1],10); //Collect previous value.
					if (isNaN(num)){ //if it isn't a number, we roll 1 dice
						num = 1;
					}
				}
				//Now determine what kind of dice to roll
				dice = parseInt(arr[index+1],10);
				let rl = [];
				if (num == 1){
					rl.num = "";
				} else{
					rl.num = num;
				}
				rl.dice = dice;
				rl.rolls = []
				rl.subtotal = 0;
				//Roll Dice
				for (let i = num; i>0;i--){
					let roll = Math.ceil(Math.random()*dice);
					rl.rolls.push(roll);
					rl.subtotal += roll;
				};
				//Find if they wanted to reroll any results
				let reroll = hasMod('r',index,arr);
				if (reroll){
					rl.subtotal = 0 //Re-do subtotal given that it will change
					reroll = parseInt(arr[reroll+1],10); //Check number to reroll
					if (isNaN(reroll)){
						return message.channel.send('You must specify which number you wish to reroll');
					}
					rl.rolls.forEach(function(v,i,arr){
						if (v==reroll){
							rl.rolls[i] = Math.ceil(Math.random()*dice);
						}
						rl.subtotal+=rl.rolls[i];
					})

					rl.dice += "r"+reroll;
				}

				//Find if they wanted to keep the highest x dice
				let keep = hasMod('k',index,arr);
				if (keep){
					rl.subtotal = 0 //Re-do subtotal given that it will change.
					keep = parseInt(arr[keep+1],10); //Check number of dice to keep is specified
					if (isNaN(keep)){
						return message.channel.send('You must specify how many dice you wish to keep');
					}
					rl.dice += "k"+keep;
					let sortArr = []; //Create array for sorted dice rolls.
					rl.rolls.forEach(function(v,i,arr){
						sortArr.push(v);
					})
					sortArr.sort(function(a,b){return b-a});
					for (let i=0;i<keep;i++){
						rl.subtotal += sortArr[i];
					}
				}

				//'running' keeps track of totals of dice we are asked to add together
				running += rl.subtotal;
				if (!hasMod('+',index,arr)){
					totals.push(running);
					running = 0;
				}	
				rolls.push(rl);
			}
		})
		let embed;

		//Create strings from dice rolls
		let desc = ""
		let total = "";
		let strs = [];
		let subs = [];
		rolls.forEach(function(rol,i,array){
			let str = "**"+rol.num+"d"+rol.dice+":** ";	
			rol.rolls.forEach(function(d,i,array){
				if (i<rol.rolls.length-1){
					str+=d+", ";
				}else{
					str+=d+" **(";
				}
			})
			str+=rol.subtotal+")**";

			strs.push(str);	
		});
		//Form description
		strs.forEach(function(s,i,array){
			desc += s+"\n";
		})
		//Form title
		totals.forEach(function(t,i,array){
			if (i==totals.length-1){
				total += t;
			}else{
				total +=t+", ";
			}
		})

		//Create Message
		if (num !=1){
			embed = {
			  "description": desc,
			  "color": 15385676,
			  "author": {
			    "name": total
			  }
			};
		} else{
			embed = {
			  "color": 15385676,
			  "author": {
			    "name": total
			  }
			};			
		};

		return message.channel.send({embed});
	}
}

module.exports = DiceCommand;