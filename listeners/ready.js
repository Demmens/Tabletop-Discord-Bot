const { Listener } = require("discord-akairo");
const Discord = require("discord.js");

class ReadyListener extends Listener {
    constructor() {
        super(
            "ready",
            {
                emitter: "client",
                event: "ready"
            }
        );
    }

    async exec() {
        if (this.client.testMode) {
            console.log("Started in testing mode.");
        } else {
            console.log("Started in normal mode.");
        }
        for (let [_,guild] of this.client.guilds.cache) {
            for (let [_,channel] of guild.channels.cache) {
                if (channel.name == "welcome") {
                    let messages = await channel.messages.fetch({ limit: 100 });
                    for (let [_,message] of messages) {
                        if (message.content.startsWith("**ROLES**")) {
                            console.log(`Found roles message for ${guild.name}`);
                        }
                    }
                }
                else if (channel.id == 704331861534441532){
                    let messages = await channel.messages.fetch({ limit: 100 });
                    for (let [_,message] of messages){
                        if (message.content.startsWith("**First time players")){
                            console.log(`Found first time players message for ${guild.name}`);
                        }
                    }
                }
            }
        }
    }
}

module.exports = ReadyListener;