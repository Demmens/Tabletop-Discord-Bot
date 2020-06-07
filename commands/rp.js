const { Command } = require("discord-akairo");
const RP_COLOUR = '#206694';

class RpCommand extends Command {
	constructor() {
		super("rp", {
			aliases: ["rp"],
			args: [
				{id: "command", type: "string", default: "help"},
				{id: "name", type: "string", default: ''}
			],
			description: "Manages channels for your roleplay game"
		});
	}
	async exec(message, args) {
		const gld = message.guild
		const us = message.member
		let isGM = false;
		let inGame = 0;

		//Check all the members roles
		for (let role of us.roles.cache){
			//Check that they have the GM role
			if (role[1].name == "GM"){isGM = true;}
			//Check whether they're currently in a game
			if (role[1].hexColor == RP_COLOUR){inGame = role[1];}
		}

		if (args.command == 'create') {

			for (let role of gld.roles.cache) {
				//Check that role doesn't already exist
				if (role[1].name == args.name){
					if (role[1].hexColor == RP_COLOUR){return message.channel.send('A game of that name already exists.');}
					return message.channel.send('You may not use that name.');
				}			
			}
			if (inGame != 0){
				return message.channel.send('You are already a part of a game. You must leave your current game before you can create one.')
			}

			if (!isGM){
				return message.channel.send('You must have the GM role to use that command. Ask the roleplay rep if you wish to run a game.')
			}

			if (args.name == ''){
				return message.channel.send('Please specify the name of your game.');
			}
			
			//Create Role
			let newRole = await gld.roles.create({
				data: {
					name: args.name,
					color: RP_COLOUR
				}
			})

			//give creator the role
			us.roles.add(newRole);
			//Create Corresponding Channels
			let categ = await gld.channels.create(args.name, {
				type: 'category',
				permissionOverwrites:[
					{
						id: newRole.id,
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
						id: gld.roles.everyone,
						deny: ['VIEW_CHANNEL']
					}
				],
				parent: categ,
			});

			return message.channel.send('Created your game: \''.concat(args.name,'\'.'));
		//Help Command
		} else if (args.command == 'help'){
			return message.channel.send('/rp create [name] - Makes channels for a game\n/rp rename [new name] - Renames the channels\n/rp remove - Removes your channels\n/rp leave - Leaves your current game')
		//Leave Command
		} else if (args.command == 'leave'){
			if (inGame == 0){
				return message.channel.send('You are not currently in a game.')	
			}
			if (isGM){
				return message.channel.send('You may not leave your game if you are a GM. Instead use \'/rp remove\' to remove your game.');
			}
			us.roles.remove(inGame);
			return message.channel.send('Successfully left your game.');			
		//Remove Command
		} else if (args.command == 'remove'){
			if (inGame == 0){
				return message.channel.send('You are not currently in a game.')
			}
			if (!isGM){
				return message.channel.send('Only the GM may remove the game.')
			}
			//Delete Channels
			for (let chnl of gld.channels.cache){
				if(chnl[1].name == inGame.name){
					await chnl[1].delete('Deleted by GM');
				}
			}
			//Delete Roles
			for (let role of gld.roles.cache){
				if(role[1] == inGame){
					await role[1].delete('Deleted by GM');
				}
			}
			return message.channel.send('Successfully removed game.')
		} else if (args.command == 'rename'){
			if (inGame == 0){
				return message.channel.send('You are not currently in a game.')
			}
			if (!isGM){
				return message.channel.send('Only the GM may rename the game.')
			}
			//Delete Channels
			for (let chnl of gld.channels.cache){
				if(chnl[1].name == inGame.name){
					await chnl[1].edit({name: args.name});
				}
			}
			//Delete Roles
			for (let role of gld.roles.cache){
				if(role[1] == inGame){
					await role[1].edit({name: args.name});
				}
			}
			return message.channel.send('Successfully renamed game.')
		}
	}
}
module.exports = RpCommand;