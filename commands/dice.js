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
		let tbl = msg[0].split("d"); //turns /5d6 into ["/5","6"], turns /d6 into ["/","6"]

		let dice = parseInt(tbl[1], 10); //Dice is the sides on the dice
		let num = 1; //Num is how many dice to roll

		if (tbl[0] != "/"){ //check if number of dice is specified
			num = tbl[0].split("/")[1];
		}



		var i;
		let author = 0;
		let desc = num+"d"+dice+": ";
		for (i = num; i>0;i--){
			let roll = Math.floor(Math.random()*dice)+1;
			author += roll; //author is dice total
			desc += roll.toString(); //desc shows all rolls
			if (i!=1){ desc += ", ";}
		};
		let embed;

		//Create message from parts
		if (num !=1){
			embed = {
			  "description": desc,
			  "color": 15385676,
			  "author": {
			    "name": author
			  }
			};
		} else{
			embed = {
			  "color": 15385676,
			  "author": {
			    "name": author
			  }
			};			
		};

		return message.channel.send({embed});
	}
}

module.exports = DiceCommand;