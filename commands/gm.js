const { Command } = require("discord-akairo");

class GmCommand extends Command {
	constructor() {
		super("gm", {
			aliases: ["gm"],
			args: [
				{id: "command", type: "string", default: "help"},
				{id: "name", type: "string", default: 'asdf'}
			],
			description: "Manages channels for your roleplay game"
		});
	}
	async exec(message, args) {
		if (args.command == 'create') {
			if (args.name == 'asdf'){
				return message.channel.send('Please specify the name of your game');
			} else{
				//Create Role
				const gld = message.guild

				let newRole = await gld.roles.create({
					data: {
						name: args.name,
						color: 'DARK_GOLD'
					}
				})

				//give creator the role
				message.member.roles.add(newRole);
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

				return message.channel.send('Created your game: \''.concat(args.name,'\''));
			}

		} else if (args.command == 'help'){
			return message.channel.send('/gm create [name] - Makes channels for a game\n/gm rename [new name] - Renames the channels\n/gm remove - Removes your channels')
		}
	}
}

module.exports = GmCommand;