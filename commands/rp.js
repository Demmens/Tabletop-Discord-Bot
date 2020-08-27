const { Command } = require("discord-akairo");
const config = require("../config.js");
const Discord = require("discord.js");
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
		let isRP = false;
		let inGame = false;

		if (message.channel.id != 719323871580258376 && message.channel.id != 719204772590256159){
			let msg = await message.channel.send('Please keep this command usage in '+ message.guild.channels.resolve('719323871580258376').toString());
			message.delete();
			setTimeout(function(){msg.delete()}, 3000);
			return
		}

		//Check all the members roles
		for (let role of us.roles.cache){
			//Check they have the GM role
			if (role[1].name == "GM"){isGM = true;}
			//Check they have the Rp role
			if (role[1].name == "Roleplay"){isRP = true;}
			//Check whether they're currently in a game
			if (role[1].hexColor == RP_COLOUR){inGame = role[1];}
		}

		if (!isRP){
			return message.channel.send('You must have the Roleplay role to use this command. React to the bot in ' + message.guild.channels.resolve('704330819392766035').toString() + ' to get the role.');
		}

		if (args.command == 'create') {

			if (!isGM){
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
			return message.channel.send('/rp create [name] - Makes channels for a game\n/rp rename [new name] - Renames the channels\n/rp remove - Removes your channels\n/rp leave - Leaves your current game\n/rp join [name] - Joins the game of that name')
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

			let GMRoles = [];

			for( let role of us.roles.cache){
				if (role[1].hexColor == RP_COLOUR && role[1].name.slice(role[1].name.length-3) == ' GM'){
					GMRoles.push(role[1].name.slice(0, role[1].name.length-3));
				}
			}

			if (inGame == 0){
				return message.channel.send('You are not currently in a game.')
			}
			if (GMRoles.length == 0){
				return message.channel.send('You are not the GM of any games.')
			}

			for (let i = 0; i < GMRoles.length; i++) {
				GMRoles[i] = [config.emoji_letters[i], GMRoles[i]]
			}

			let sent = await message.channel.send(
				new Discord.MessageEmbed()
				.setColor(config.colour)
				.setAuthor('Which game would you like to remove?')
				.addField("⠀", [GMRoles.map(item => item.join(" - "))].join("\n")))
			for (let i = 0; i < GMRoles.length; i++) {
				await sent.react(config.emoji_letters[i]);
			}

			let inGameName = inGame.name.slice(0, inGame.name.length-3)

			//Delete Channels
			//Make two passes, ignoring category the first time so nothing moves around weirdly.
			for (let chnl of gld.channels.cache){
				if(chnl[1].name == inGameName.name && chnl[1].type != 'category'){
					await chnl[1].delete('Deleted by GM');
				}
			}
			for (let chnl of gld.channels.cache){
				if(chnl[1].name == inGameName.name && chnl[1].type == 'category'){
					await chnl[1].delete('Deleted by GM');
				}
			}
			//Delete Roles
			for (let role of gld.roles.cache){
				if(role[1] == inGame){
					await role[1].delete('Deleted by GM');
				}
				if(role[1].name == inGameName+" GM"){
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
		//Join Command
		} else if (args.command == 'join'){

			if (isGM){
				return message.channel.send('You cannot join a game as a GM. Instead use \'/rp create [name]\' to create your campaign.')
			}

			let roleExists = 0;

			for (let role of gld.roles.cache){
				if (role[1].name == args.name && role[1].hexColor == RP_COLOUR){
					roleExists = role[1];
				}
			}

			if (roleExists == 0){
				return message.channel.send('There is no game of that name');
			}

			if (inGame != 0){
				us.roles.remove(inGame, 'Joined new game');
			}
			us.roles.add(roleExists, 'Joined new game');
			return message.channel.send('You have successfully joined '+roleExists.name+'.')
		}
	}
}
module.exports = RpCommand;