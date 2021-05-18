const { Listener } = require("discord-akairo");
const Discord = require("discord.js");

class mcListener extends Listener {
    constructor() {
        super(
            "mcIntegration",
            {
                emitter: "client",
                event: "message"
            }
        );
    }

    async exec(message) {
        const pizzaTimeId = 361569079514890252;
        const ttsID = 704330818834792499;
        const pizzaTimeChannel = 363725628245278721;
        const ttsChannel = 824063699547193384;
        if (message.channel.id == ttsChannel)
        {
            for (let [_,gld] of this.client.guilds.cache)
            {
                console.log(gld.id);
                if (gld.id == pizzaTimeId)
                {
                    for (let [_,chnl] of gld.channels.cache)
                    {
                        if (chnl.id == pizzaTimeChannel)
                        {
                            if (message.member.user.id != 708801223083556898)
                            {
                                chnl.send(`[Discord] ${message.member.displayName}: ${message.content}`);
                            }
                            else
                            {
                                chnl.send(message.content);
                            }
                        }
                    }
                }
            }
        }
    }
}

module.exports = mcListener;