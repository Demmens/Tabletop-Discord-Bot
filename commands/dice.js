const { Command } = require("discord-akairo");

class DiceCommand extends Command {
	constructor() {
		super("dice", {
			args: [{id: "message", type: "string", match: "content"}],
			description: "Rolls dice",
			regex: /^\/\d*d\d*(\s|$)/i
		});
	}
	exec(message, args) {
		let cont = message.content;
		let msg = cont.split(" ");
		let arr = msg[0].split(/(?<=\D)(?=\d+)|(?<=\d)(?=\D+)| |\//); //split string into an array of numbers and words while deleting spaces.
		let dice; //Dice is the number of sides on the dice		
		let num; //Num is how many dice to roll
		let rolls = [];

		arr.forEach(function(char,index,array){ //Loop through characters and find things we need.
			if (char == " "){
				arr.splice(index,1); //Remove all spaces from the array, we don't need them.
			} else{
				if (char == "d"){ //Main use. Detect when dice are specified.
					//First determine how many dice to roll
					if (index == 0){
						num = 1;
					}
					else{
						let num = parseInt(arr[index-1],10); //Collect previous value.
						if (isNaN(num)){ //if it isn't, we roll 1 dice
							num = 1;
						}
					}
					//Now determine what kind of dice to roll
					let dice = parseInt(arr[index+1],10);
				}
			}
		})

		// Roll Dice
		for (let i = num; i>0;i--){
			let roll = Math.floor(Math.random()*dice)+1;
			rolls.push(roll);
		};
		let embed;

		//Create strings from dice rolls
		let desc = num+"d"+dice+": ";
		let total = 0;
		rolls.forEach(function(d, i, array){
			total += d;
			desc += d.toString();
			if (i!=rolls.length-1){desc += ", "};
		})

		//Create message from parts
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