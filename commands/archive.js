const { Command } = require("discord-akairo");
const fs = require('fs');

class ArchiveCommand extends Command {
	constructor() {
		super("archive", {
			aliases: ["archive"],
			description: "Archive the messages in a channel"
		});
	}
    *args(message)
    {
        const confirm = yield{
            type: 'yes/no',
            prompt:{
                start: message => `${message.author} Are you sure you wish to archive this channel? This can take a long time if there are a lot of messages.`,
                retry: message => `${message.author} Please enter "yes" or "no".`	,
                prompt: true
            }
        };

        return {confirm};
    }

	async exec(message, args) {
        if (args.confirm.toLowerCase() != "yes") return message.channel.send("Channel not archived");
        const archiveMessage = await message.channel.send("Archived 0 messages");

        const allMessages = [];
        let lastID;
        while (true)
        {
            const options = {limit:100}
            if (lastID) options.before = lastID;
            let messages = await message.channel.messages.fetch(options);
            allMessages.push(...messages.array());
            lastID = messages.last().id;
            if (messages.size != 100) break;
            else if (allMessages.length % 500 == 0) await archiveMessage.edit(`Archived ${allMessages.length} messages`);
        }
        await archiveMessage.edit(`Archived all ${allMessages.length} messages`);
        let ReorderedMessages = [];
        let text = "";
        for (let msg of allMessages)
        {
            ReorderedMessages.unshift(msg);
            if (msg.member) text = `${msg.member.displayName}: ${msg.content}\n${text}`
            else text = `${msg.author.username}: ${msg.content}\n${text}`;
        }

        fs.writeFileSync("./Commands/archive.txt", text);
        message.channel.send({
            files:["./Commands/archive.txt"]
        });
	}
}

module.exports = ArchiveCommand;