const { Command } = require("discord-akairo");
const config = require("../../config.js");
const Discord = require("discord.js");


class CreateGameCommand extends Command {
	constructor() {
		super("rpCreate", {
			aliases: ["rpCreate"],	
		});
	}
	*args(message){
		let isGM = false;
		for (let [_,rl] of message.member.roles.cache){
			if (rl.name == 'GM'){isGM = true;}
		}
		if(isGM){
			const name = yield{
				type: 'gameName',
				prompt:{
					start: message => `${message.author} What do you want to call your game?`,
					retry: message => `${message.author} Either a game of that name already exists, or you used an invalid name. Please try again.`	,
					prompt: true
				}
			};
			const maxPlayers = yield{
				type: 'number',
				prompt:{
					start: message => `${message.author} What is the max number of players you can run for?`,
					retry: message => `${message.author} Please input a number.`,
					prompt: true
				}
			};
			const system = yield{
				id: 'system',
				type: 'string',
				prompt:{
					start: message => `${message.author} What system will you be running?`,
					retry: message => `${message.author} Please input a valid name.`,
					prompt: true
				}
			};
			const description = yield{
				id: 'description',
				type: 'string',
				prompt:{
					start: message => `${message.author} Write a short description for your campaign (You can edit this later)`,
					retry: message => `${message.author} Please input a valid description.`,
					time:1800000,
					prompt: true
				}
			};
			return{name, maxPlayers, system, description}
		} else{
			return message.channel.send(`${message.author} You do not have the GM role. Ask the roleplay rep to acquire it.`);
		}
	}

	async exec(message, args) {
		if (args.name){
			const gld = message.guild
			const RP_COLOUR = '#206694';
			const us = message.member;
			let embChnl;
			const embed = new Discord.MessageEmbed()
			.setColor(config.colour)
			.setTitle(args.name)
			.setDescription(args.description)
			.addFields([
			{
				"name": `GM`,
				"value": message.author
			},
			{
				"name": `Players (0/${args.maxPlayers})`,
				"value": `No Current Players`
			},
			{
				"name": `System`,
				"value": args.system
			},
			{
				"name": `Time & Days`,
				"value": `Undecided`
			}
			])
			for (let [_,chnl] of message.guild.channels.cache){
				if (chnl.name == 'active-games' && chnl.parent.name.toUpperCase() == 'ROLEPLAY'){
					chnl.send(embed);
					embChnl = chnl;
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
			let generalChat = await gld.channels.create('general', {
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
			gld.channels.create('voice', {
				type: 'Voice',
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

			return generalChat.send(`${message.author} Welcome to your new game! This is where you will be communicating with your players online! A message has been posted in ${embChnl} containing the information about your campaign. You can edit this and other aspects of your game with \`/rpedit\`.`);
		}
	}
}

module.exports = CreateGameCommand;