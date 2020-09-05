const { Command } = require("discord-akairo");
const RP_COLOUR = '#206694';

class RpCommand extends Command {
	constructor() {
		super("rp", {
			aliases: ["rp"],
			args: [
				{id: "command", type: "string", default: "help"},
				{id: "name", type: "string", default: ''},
				{id: "type", type: "string", default: ''},
				{id: "campaign", type: "string", default: ''}
			],
			description: "Manages channels for your roleplay game"
		});
	}
	async exec(message, args) {
		const gld = message.guild
		const us = message.member
		let hasGM = false;
		let isRP = false;
		let inGame = false;

		if (message.channel.id != 719323871580258376 && message.channel.id != 719204772590256159){
			let msg = await message.channel.send('Please keep this command usage in '+ message.guild.channels.resolve('719323871580258376').toString());
			message.delete();
			setTimeout(function(){msg.delete()}, 3000);
			return
		}

		//Check what games they are the GM of.
		let GMRoles = [];
		for( let role of us.roles.cache){
			if (role[1].hexColor == RP_COLOUR && role[1].name.slice(role[1].name.length-3) == ' GM'){
				GMRoles.push(role[1].name.slice(0, role[1].name.length-3));
			}
		}

		function isGM(game){
			for (let role of GMRoles){
				if (game == role[1]){
					return true
				}
			}
			return false
		}

		//Check all the members roles
		for (let role of us.roles.cache){
			//Check they have the GM role
			if (role[1].name == "GM"){hasGM = true;}
			//Check they have the Rp role
			if (role[1].name == "Roleplay"){isRP = true;}
			//Check whether they're currently in a game
			if (role[1].hexColor == RP_COLOUR){inGame = role[1];}
		}
		

		if (!isRP){
			return message.channel.send('You must have the Roleplay role to use this command. React to the bot in ' + message.guild.channels.resolve('704330819392766035').toString() + ' to get the role.');
		}
		//Create Command
		if (args.command == 'create') {

			if (!hasGM){
				return message.channel.send('You must have the GM role to use that command. Ask the roleplay rep if you wish to run a game.')
			}

			if (args.name == ''){
				return message.channel.send('Please specify the name of your game.');
			}
			if (args.name.slice(args.name.length-3) == ' GM') {
				return message.channel.send('You may not use that name.')
			}

			for (let role of gld.roles.cache) {
				//Check that role doesn't already exist
				if (role[1].name == args.name){
					if (role[1].hexColor == RP_COLOUR){return message.channel.send('A game of that name already exists.');}
					return message.channel.send('You may not use that name.');
				}			
			}
			
			//Create Role
			let newRole = await gld.roles.create({
				data: {
					name: args.name,
					color: RP_COLOUR
				}
			})

			let newGMRole = await gld.roles.create({
				data: {
					name: args.name+" GM",
					color: RP_COLOUR
				}
			})

			//give creator the role
			us.roles.add(newGMRole);
			//Create Corresponding Channels
			let categ = await gld.channels.create(args.name, {
				type: 'category',
				permissionOverwrites:[
					{
						id: newRole.id,
						allow: ['VIEW_CHANNEL']
					},
					{
						id: newGMRole.id,
						allow: ['VIEW_CHANNEL']
					},
					{
						id: gld.roles.everyone,
						deny: ['VIEW_CHANNEL']
					}
				],
			});
			//Create Text Channel
			gld.channels.create(args.name, {
				type: 'text',
				permissionOverwrites:[
					{
						id: newRole.id,
						allow: ['VIEW_CHANNEL']
					},
					{
						id: newGMRole.id,
						allow: ['VIEW_CHANNEL']
					},
					{
						id: gld.roles.everyone,
						deny: ['VIEW_CHANNEL']
					}
				],
				parent: categ,
			});
			//Create Voice Channel
			gld.channels.create(args.name, {
				type: 'voice',
				permissionOverwrites:[
					{
						id: newRole.id,
						allow: ['VIEW_CHANNEL']
					},
					{
						id: newGMRole.id,
						allow: ['VIEW_CHANNEL']
					},
					{
						id: gld.roles.everyone,
						deny: ['VIEW_CHANNEL']
					}
				],
				parent: categ,
			});

			return message.channel.send('Created your game: \''.concat(args.name,'\'.'));
		//Help Command
		} else if (args.command == 'help'){
			return message.channel.send('/rp create [name] - Makes channels for a game\n/rp remove [name] - Removes the specified campaign (must be GM)\n/rp leave [name] - Leaves the game of that name\n/rp join [name] - Joins the game of that name\n/rp createchannel [name] [text/voice] [game] Creates a new channel in your game category');
		//Leave Command
		} else if (args.command == 'leave'){
			if (isGM(args.name)){
				return message.channel.send('You may not leave your game if you are a GM. Instead use \'/rp remove '+args.name+'\' to remove your game.');
			}
			if (inGame == 0){
				return message.channel.send('You are not currently in a game.');
			}
			if (args.name == ''){
				return message.channel.send('Please specify which game you wish to leave');
			}

			for( let role of us.roles.cache){
				if (role[1].hexColor == RP_COLOUR && role[1].name == args.name){
					us.roles.remove(role[1]);
					return message.channel.send('Successfully left your game.');
				}
			}
			
			return message.channel.send('Could not find game \''+args.name+'\'');
						
		//Remove Command
		} else if (args.command == 'remove'){
			let gameName = args.name;
			if (inGame == 0){
				return message.channel.send('You are not currently in a game.');
			}
			if (GMRoles.length == 0){
				return message.channel.send('You are not the GM of any games.');
			}
			if (gameName == '' && GMRoles.length != 1){
				return message.channel.send('Please specify which game you wish to remove');
			}
			if (GMRoles.length == 1){
				gameName = GMRoles[0];
			}

			if (isGM(gameName)){
				//Delete Channels
				let categ = 0;
				for (let chnl of gld.channels.cache){ //Find corresponding category
					if(chnl[1].name == gameName && chnl[1].type == 'category'){
						categ = chnl[1];
					}
				}
				//Clear out all channels in category
				for (let chnl of gld.channels.cache){
					if(chnl[1].parent == categ){
						await chnl[1].delete('Deleted by GM');
					}
				}
				await categ.delete('Deleted by GM'); //Delete Category
				
				//Delete Roles
				for (let role of gld.roles.cache){
					if(role[1].name == gameName){
						await role[1].delete('Deleted by GM');
					}
					if(role[1].name == gameName+" GM"){
						await role[1].delete('Deleted by GM');
					}
				}
				return message.channel.send('Successfully removed game.');
			}else{ return message.channel.send('You are not the GM of the game \''+args.name+'\''); }
		//Rename Command
		/*
		} else if (args.command == 'rename'){
			if (inGame == 0){
				return message.channel.send('You are not currently in a game.');
			}
			if (!isGM()){
				return message.channel.send('Only the GM may rename the game.');
			}
			//Rename Channels
			for (let chnl of gld.channels.cache){
				if(chnl[1].name == inGame.name){
					await chnl[1].edit({name: args.name});
				}
			}
			//Rename Roles
			for (let role of gld.roles.cache){
				if(role[1] == inGame){
					await role[1].edit({name: args.name});
				}
			}
			return message.channel.send('Successfully renamed game.');
			*/
		//Join Command
		} else if (args.command == 'join'){

			let roleExists = 0;

			for (let role of gld.roles.cache){
				if (role[1].name == args.name && role[1].hexColor == RP_COLOUR && role[1].name.slice(role[1].name.length-3) != ' GM'){
					roleExists = role[1];
				}
			}

			if (roleExists == 0){
				return message.channel.send('There is no game of that name');
			}

			for (let role of us.roles.cache){
				if (role[1] == roleExists){
					return message.channel.send('You are already in that game');
				}
			}

			us.roles.add(roleExists, 'Joined new game');
			return message.channel.send('You have successfully joined '+roleExists.name+'.');

		//Createchannel command
		} else if (args.command == 'createchannel'){
			let chName = args.name;
			let chType = args.type;
			let chGame = args.campaign;

			if (GMRoles.length == 1 && chGame == ''){ //If they didn't specify a game and are only GMing one campaign
				chGame = GMRoles[0]; //Create channel in that campaign category
			}

			if (args.name == ''){
				return message.channel.send('Please specify the name for the channel.')
			}
			for (let cnl of message.guild.channels.cache){
				if (cnl[1].name == chName){
					return message.channel.send('You cannot have multiple channels of the same name.')
				}
			}

			if (args.type != 'voice' && args.type != 'text'){
				return message.channel.send('Invalid type. Must be text or voice.');
			}

			let gmRl = 0;
			for (let rl of us.roles.cache){ //Check user has the corresponding GM role.
				if (rl[1].name == chGame + ' GM'){
					gmRl = rl[1]; //While here, fetch the role for later
				}
			}
			if (gmRl == 0){
				return message.channel.send('You are not GM of that game.');
			}

			let regRl = 0 //Fetch non-gm variant of the role too.
			for (let rl of message.guild.roles.cache){
				if (rl[1].name == chGame){
					regRl = rl[1];
				}
			}

			for (let chnl of message.guild.channels.cache){ //Create the channel
				if (chnl[1].name == chGame && chnl[1].type == 'category'){ //Find correct category
					gld.channels.create(args.name, {
						type: args.type,
						permissionOverwrites:[
							{
								id: regRl.id,
								allow: ['VIEW_CHANNEL']
							},
							{
								id: gmRl.id,
								allow: ['VIEW_CHANNEL']
							},
							{
								id: gld.roles.everyone,
								deny: ['VIEW_CHANNEL']
							}
						],
						parent: chnl[1],
					});
				}
			}
			return message.channel.send("Successfully created your "+chType+" channel '"+chName+"'.");
		//Removechannel command
		}else if (args.command == 'removechannel'){			
			let chName = args.name;
			let chGame = args.type;

			if (GMRoles.length == 1 && chGame == ''){ //If they didn't specify a game and are only GMing one campaign
				chGame = GMRoles[0]; //Remove channel in that campaign category
			}

			let chan = 0;
			let num = 0;
			for (let ch in message.guild.channels.cache){
				if (chName == ch[1].name && ch[1].parent.type == "category" && isGM(ch[1].parent.name)){ //Search through channels in games they GM.
					return message.channel.send("Name: " + ch[1].name+' Category: '+ch[1].parent.name)
					if (chan != 0){ //Triggers if there is more than one channel found of that name they are GM of.
						if (chGame == ''){ //If they didn't specify which game to remove the channel from
							return message.channel.send('Please specify which campaign you wish to remove the channel from')
						}
						if (chGame == ch[1].parent.name){ //Otherwise if this is the specified game
							chan = ch[1];
							break //We've found the correct channel.
						}
					} 

					if (ch[1].type == 'text'){
						num++; //Count number of text channels
					}

					chan = ch[1]; //Most of the time this will select the correct channel.
				}
			}

			if (chan == 0){
				return message.channel.send("Could not find channel: '"+chName+"'.");
			}
			if (num == 1 && chan.type == 'text'){
				return message.channel.send("You must have at least one text channel in your game.");
			}
			await chan.delete('Deleted by GM'); //Remove channel
			return message.channel.send("Successfully removed channel '"+chName+"'.");
		}
	}
}
module.exports = RpCommand;