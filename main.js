const { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } = require("discord-akairo");
const config = require("./config.js");
const func = require('./functions.js');



var token, prefix, testMode;
try {
	token = require("./token.json").key;
	console.log("Starting using locally stored value for token...");
	prefix = config.test_prefix;
	testMode = true;
}
catch(error) {
	token = process.env.TOKEN;
	console.log("Starting using token stored on Heroku...");
	prefix = config.main_prefix;
	testMode = false;
}

class MyClient extends AkairoClient {
	constructor() {
		super({
			ownerID: config.owner_id
		});

		this.commandHandler = new CommandHandler(
			this,
			{
				directory: "./commands/",
				prefix: prefix,
				argumentDefaults:{
					prompt:{
						timeout: message => `<@${message.author.id}> Time ran out, command has been cancelled.`,
						cancel: message => `<@${message.author.id}> Command has been cancelled.`,
						ended: message => `<@${message.author.id}> Too many retries, command has been cancelled.`,
						retries: 4,
						time: 30000
					}
				}
			}
		);
		this.commandHandler.resolver.addType('gameName', (message, string) => {
			if (!string) return null;
			if (string.length >= 100) return null;
			for (let role of message.guild.roles.cache) {
				//Check that role doesn't already exist
				if (func.replaceHyphens(role[1].name.toUpperCase()) == func.replaceHyphens(string.toString().toUpperCase())){
					return null;
				}			
			}
			return string;
		});
		this.commandHandler.resolver.addType('yes/no', (message, string) => {
			if (string.toUpperCase() == 'YES' || string.toUpperCase() == 'NO'){
				return string;
			}
			return null;
		});
		this.commandHandler.resolver.addType('text/voice', (message, string) => {
			if (string.toUpperCase() == 'TEXT' || string.toUpperCase() == 'VOICE'){
				return string;
			}
			return null;
		});
/*		this.inhibitorHandler = new InhibitorHandler(
			this,
			{
				directory: "./inhibitors/"
			}
		);*/
		this.listenerHandler = new ListenerHandler(
			this,
			{
				directory: "./listeners/"
			}
		);

		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
		
		this.commandHandler.loadAll();
		//this.inhibitorHandler.loadAll();
		this.listenerHandler.loadAll();
		
	}
}

const client = new MyClient();

client.functions = require('./functions.js');

client.ownerID = 144543622015090690;

client.on("ready", async () => {
	console.log('ready')
	if (!testMode){
		let categories = client.commandHandler.categories.filter(c => c.id !== 'default').sort((a, b) => a.size - b.size);
		let commands = client.commandHandler.modules;
		let [cmds,_] = client.commandHandler.categories;

		for (let [id,cmd] of cmds[1]){
			if (cmd.description.name){
				client.api.applications(client.user.id).guilds('704330818834792499').commands.post({
			        data: cmd.description
			    });
			}
		}

		

	    client.ws.on('INTERACTION_CREATE', async interaction => {
	       	var command = prefix + interaction.data.name.toLowerCase();
	       	const args = interaction.data.options;
	        if (args){
		        for (let arg of args){
					command += ` ${arg.value}`;
		        }
		    }
	        var message = {}; //Create artificial message.
	        message.member = interaction.member;
	        message.content = command;
	        message.author = interaction.member.user;
	        message.channel = await client.channels.fetch(interaction.channel_id);
	        message.guild = message.channel.guild;
	        client.api.interactions(interaction.id, interaction.token).callback.post({
	            data: {
	                type: 5
	            }
	        })
	        client.commandHandler.handle(message); //Act as if that message was sent by that user in that channel.
	    });
	}
});

client.testMode = testMode;

client.login(token);