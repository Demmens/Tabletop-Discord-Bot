const { Command } = require("discord-akairo");

class EchoCommand extends Command {
	constructor() {
		super("edit", {
			aliases: ["edit"],
			description: "Edits a message sent by the bot"
		});
	}
	*args(message)
	{
		if (message.author.id != 144543622015090690) return;
		const channelID = yield{
			type: 'int',
			prompt:{
				start: message => `${message.author} Please enter the id of the channel that contains the message`,
				retry: message => `${message.author} Please enter a valid number`,
				prompt: true
			}
		};
		const messageID = yield{
			type: 'int',
			prompt:{
				start: message => `${message.author} Please enter the id of the message`,
				retry: message => `${message.author} Please enter a valid number`,
				prompt: true
			}
		};
		const newContent = yield{
			type: 'string',
			prompt:{
				start: message => `${message.author} Enter the new contents for the message`,
				retry: message => `${message.author} Please enter a valid number`
			}
		}

		return {channelID,messageID,newContent};
	}
	async exec(message, args) {
		if (message.author.id != 144543622015090690) return;

		for (let [_,channel] of message.guild.channels.cache)
		{
			if (channel.id == args.channelID)
			{
				let messages = await channel.messages.fetch({limit:100});
				for (let [_,msg] of messages)
				{
					if (msg.id == args.messageID)
					{
						return msg.edit(args.newContent);
					}
				}
				return message.channel.send(`Could not find the message. It must be within the last 100 messages sent in the channel.`);
			}
		}

		return message.channel.send(`Could not find the channel. It must be in the same server that you type the command in.`);
	}
}

module.exports = EchoCommand;