const { Command } = require("discord-akairo");
const Discord = require("discord.js");
const config = require("../config.js");

const commandInfo = {
	id: "poll",
	aliases: [],
	args: [{id: "options", type: "string", match: "content"}],
	description: {
		short: "Creates a poll.",
		extend: "The question and options should be seperated by a semi-colon, like this: `question; option 1; option 2; option 3` etc.",
	}
}

commandInfo.aliases.unshift(commandInfo.id)
commandInfo.description.long = commandInfo.description.short + "\n" + commandInfo.description.extend
commandInfo.description.args = commandInfo.args.map(item => item.id)

class PollCommand extends Command {
	constructor() {
		super(
			commandInfo.id,
			commandInfo
		);
	}

	async exec(message, args) {
		let msg = message.cleanContent.split(" ")
		msg.splice(0, 1)
		msg = msg.join(" ");
		let options = msg.split(";").map(item => item.trim());
		let d = 0;
		for (let i = 0; i < options.length + d; i++) {
			if (options[i - d] == "") {
				options.splice(i - d, 1);
				d ++;
			}
		}

		if (3 <= options.length && options.length <= 20) {
			let nickname = message.author.nickname
			if (nickname == null) {nickname = message.author.username}
			let question = options.shift();
			for (let i = 0; i < options.length; i++) {
				options[i] = [config.emoji_letters[i], options[i]]
			}

			let sent = await message.channel.send(
				new Discord.MessageEmbed()
				.setColor(config.colour)
				.setAuthor(nickname + " asked:", message.author.avatarURL())
				.addField("⠀", [`**${question}**\n`, ...options.map(item => item.join(" - "))].join("\n")))
			for (let i = 0; i < options.length; i++) {
				await sent.react(config.emoji_letters[i]);
			}
			if (message.channel.type != "dm") {
				return await message.delete();
			}
		} else {
			return message.reply("Something went wrong - options should be seperated by a semi-colon, like this: `question; option 1; option 2; option 3` etc. and there should be between 2 and 20 options.")
		}
	}
}


module.exports = PollCommand;

//Thanks to Joe Gibson for the code