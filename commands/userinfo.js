const { Command } = require("discord-akairo");
const moment = require("moment");

class InfoUserCommand extends Command {
    constructor() {
        super("userinfo", {
            aliases: ["userinfo"],
            args: [
                {id: "member", type: "member"},
            ],
        });
    }

    async exec(message, args) {
        let member;
        if(args.member) {
            member = args.member;
        } else {
            member = message.member;
        }
        const joinDate = new moment(member.joinedAt);
        const createdDate = new moment(member.user.createdAt);

        const memberList = await message.guild.members.fetch();
        const joinRank = memberList.filter(b => !b.user.bot)
            .sort((a, b) => b.joinedTimestamp - a.joinedTimestamp)
            .keyArray().reverse()
            .indexOf(member.user.id) + 1;

        let roles = member.roles.cache.filter(r => r.name != "@everyone")

        await message.channel.send({ embed: {
            color: member.displayColor,
            thumbnail: {
                url: member.user.avatarURL()
            },
            footer: {
                text: `ID: ${member.user.id}`
            },
            fields: [
                {
                    name: "User",
                    value: member.user,
                    inline: true
                }, {
                    name: "Tag",
                    value: member.user.tag,
                    inline: true
                }, {
                    name: "Nickname",
                    value: ((member.nickname == null) ? "None" : member.nickname),
                    inline: true
                }, {
                    name: "Date Registered",
                    value: createdDate.format("DD MMM YYYY"),
                    inline: true
                }, {
                    name: "Date Joined",
                    value: joinDate.format("DD MMM YYYY"),
                    inline: true
                }, {
                    name: "Join Rank",
                    value: joinRank,
                    inline: true
                // }, {
                //     name: "Last Message",
                //     value: `[${moment(member.lastMessage.createdAt).format("DD MMM YY")}](${member.lastMessage.url})`,
                //     inline: true
                }, {
                    name: "Roles",
                    value: roles.map(r => r.toString()).join("\n"),
                    inline: true
                }
            ]
        }});
    }
}

module.exports = InfoUserCommand

//Thanks to Joe Gibson for the code