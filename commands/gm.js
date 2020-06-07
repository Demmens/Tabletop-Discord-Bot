const { Command } = require("discord-akairo");
const RP_COLOUR = '#206694';

class GmCommand extends Command {
	constructor() {
		super("gm", {
			aliases: ["gm"],
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
		if (args.command == 'create') {

			for (let role of gld.roles.cache) {
				//Check that role doesn't already exist
				if (role[1].name == args.name){
					if (role[1].hexColor == RP_COLOUR){return message.channel.send('A game of that name already exists.');}
					return message.channel.send('You may not use that name.');
				}			
			}
			//Check all the members roles
			let isGM = 0;
			for (let role of us.roles.cache){
				//Check that they have the GM role
				if (role[1].name == "GM"){isGM = 1;}
				//Check they're not currently in a game
				if (role[1].hexColor == RP_COLOUR){
					return message.channel.send('You are already a part of a game. You must leave your current game before you can create one.')
				}
			}

			if (isGM == 0){
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
			return message.channel.send('/gm create [name] - Makes channels for a game\n/gm rename [new name] - Renames the channels\n/gm remove - Removes your channels\n/gm leave - Leaves your current game')
		//Leave Command
		} else if (args.command == 'leave'){
			let gameRole;
			//Check all the members roles
			let isGM = 0;
			for (let role of us.roles.cache){
				//Check that they have the GM role
				if (role[1].name == "GM"){isGM = 1;}
				//Check they're not currently in a game
				if (role[1].hexColor == RP_COLOUR){
					gameRole = role[1];
				}
			}
			if (isGM == 1){
				return message.channel.send('You may not leave your game if you are a GM. Instead use \'/gm remove\' to remove your game.');
			}
			us.roles.remove(gameRole);
			return message.channel.send('Successfully left your game.');
		}
	}
}
module.exports = GmCommand;