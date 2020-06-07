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
	exec(message, args) {
		if (args.command == 'create') {
			if (args.name == 'asdf'){
				return message.channel.send('Please specify the name of your game');
			} else{
				//Create Role
				const gld = message.guild
				gld.roles.create({
					data: {
						name: args.name,
						color: 'GOLD'
					}
				})
					.then( function(){ //Do this after resolving properly
						const newRole;
						//give creator the role
						for (let role of gld.roles.cache){
							if (role[1].name == args.name){
								newRole = role[1];
								message.member.roles.add(role[1]);
							}
						}
						//Create Corresponding Channels
						gld.channels.create(args.name, {
							type: 'category',
							permissionOverwrites:[
								{
									id: newRole.id,
									allow: ['VIEW_CHANNEL']
								},
							],
						})

						return message.channel.send('Created your game: \''.concat(args.name,'\''));
					})
					.catch(console.error);

				}
		} else if (args.command == 'help'){
			return message.channel.send('/gm create [name] - Makes channels for a game\n/gm rename [new name] - Renames the channels\n/gm remove - Removes your channels')
		}
	}
}

module.exports = GmCommand;