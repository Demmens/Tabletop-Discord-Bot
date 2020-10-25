const { Command, Argument } = require("discord-akairo");
const config = require("../../config.js");
const Discord = require("discord.js");
const RP_COLOUR = '#206694';
let gmRls = [];
let chnlTbl = [];

class rpEditCommand extends Command {
	constructor() {
		super("rpEdit", {
			aliases: ["rpEdit"]
		});
	}
	*args(message){
		let us = message.author
		let removedGame;
		let gameName = 1;
		let embed;
		gmRls = [];
		for (let [_,rl] of message.member.roles.cache){ //make a table of all their games they gm
			if (rl.hexColor == RP_COLOUR && rl.name.slice(rl.name.length-3) == ' GM'){
				gmRls.push(rl.name.slice(0, rl.name.length-3));
			}
		}

		if (gmRls.length > 1){

			let rlStr = "";
			let x = 0;

			for (let i of gmRls){
				x++
				rlStr += `${x} - ${i}\n`;
			}

		    gameName = yield { 
		    	type: Argument.range('number',0,gmRls.length,true),
		    	prompt: {
		    		start: message => {
		    			embed = new Discord.MessageEmbed()
		    			.setTitle(`Which game do you wish to edit?`)
		    			.setDescription(rlStr)
		    			.setFooter(`Type 'cancel' to cancel`)

		    			return{embed};
		    		},
		    		retry: message => `${us} please enter a valid number.`,
		    		prompt: true
		    	}
		    }
	    }

	    gameName = gmRls[gameName-1];

	    const category = yield{
	    	type: Argument.range('number',0,3),
	    	prompt: {
	    		start:message => {
	    			embed = new Discord.MessageEmbed()
	    			.setTitle(`${gameName} Settings`)
	    			.setDescription('1 - Game Settings\n2- Channel Settings')
	    			.setFooter(`Type 'cancel' to cancel`)

	    			return{embed};
	    		},
	    		retry: message=> `${us} please enter a valid number`,
	    		prompt: true
	    	}
	    }

		let settingsList;//Create all the arguments here, so we can just return them all at the end to save a *lot* of hassle
		let newName; 
    	let newDesc;
    	let newImg;
   		let newMax;
    	let newSys;
    	let verify;
    	let permSettings;
    	let newPerms;
    	let name;
    	let newChName;
    	let tv;
    	let channel;
    	let verifyCh;
    	let kickPly;
    	let verifyKick;
    	let newTime;

	    
	    if (category == 1){
	    	settingsList = yield{
	    		type:Argument.range('integer',0,9),
	    		prompt: {
	    			start:message => {
	    				embed = new Discord.MessageEmbed()
	    				.setTitle('Game Settings')
	    				.setDescription('1 - Rename Game\n2 - Change Description\n3 - Add/Change Image\n4 - Change Max Players\n5 - Change System\n6 - Edit Time and Date\n7 - Kick Player\n8 - Delete Game')
	    				.setFooter(`Type 'cancel' to cancel`)

	    				return{embed};
	    			},
	    			retry: message=> `${us} Please enter a valid number`,
	    			prompt: true
	    		}
	    	}
	    	if (settingsList == 1){
		    	newName = yield{
		    		type:'gameName',
		    		prompt: {
		    			start:message=> `${us} Enter the new name for your game`,
		    			retry: message => `${us} Either a game of that name already exists, or you used an invalid name. Please try again.`,
		    			prompt: true
		    		}
		    	}
		    } else if(settingsList == 2){
		    	newDesc = yield{
		    		type:'string',
		    		prompt: {
		    			start: message => `${us} Enter your new description`,
		    			retry: message => `${us} Please enter a valid description`,
		    			time:1800000,
		    			prompt: true
		    		} 
		    	}
		    } else if(settingsList == 3){
		    	newImg = yield{
		    		type:'url',
		    		prompt: {
		    			start: message => `${us} Enter the url of the image you wish to use`,
		    			retry: message => `${us} Please enter a valid url`,
		    			prompt: true
		    		}
		    	}
		    } else if(settingsList == 4){
		    	newMax = yield{
		    		type:'integer',
		    		prompt:{
		    			start: message => `${us} Enter the new max players for your campaign`,
		    			retry: message => `${us} Please enter a valid number`,
		    			prompt: true
		    		}
		    	}
		    } else if(settingsList == 5){
		    	newSys = yield{
		    		type:'string',
		    		prompt:{
		    			start: message => `${us} Enter your new system`,
		    			retry: message => `${us} Please enter a valid system`,
		    			prompt: true
		    		}
		    	}
		    } else if(settingsList == 6){
		    	newTime = yield{
		    		type:'string',
		    		prompt:{
		    			start: message => `${us} Enter a new time and date`,
		    			retry: message => `${us} Please enter a valid message`,
		    			prompt: true
		    		}
		    	}
			} else if(settingsList == 7){
		    	let plList = [];
		    	let plStr = "";
		    	let x = 0;

		    	for (let [_,rl] of message.guild.roles.cache){
		    		if (rl.name == gameName){
		    			for (let [_,mem] of rl.members){
		    				plList.push(mem);
		    				x++
		    				plStr += `${x} - ${mem.user}\n`
		    			}
		    		}
		    	}

		    	kickPly = yield{
		    		type: Argument.range('integer',0,plList.length,true),
		    		prompt: {
		    			start: message => {
		    				embed = new Discord.MessageEmbed()
		    				.setTitle(`Which player do you wish to kick?`)
		    				.setDescription(plStr)
		    				.setFooter(`Type 'cancel' to cancel`);

		    				return{embed};
		    			},
		    			retry: message => `${us} Please enter a valid number`,
		    			prompt:true
		    		}
		    	}

		    	kickPly = plList[kickPly-1];
		    	verifyKick = yield{
		    		type:'yes/no',
		    		prompt:{
		    			start: message => `${us} Are you sure you want to kick the player '${kickPly.user}'?`,
		    			retry: message => `${us} Please enter \`yes\` or \`no\``,
		    			prompt: true
		    		}
		    	}
		    } else if(settingsList == 8){
		    	verify = yield{
		    		type:'yes/no',
		    		prompt:{
		    			start: message => `${us} Are you sure you want to delete the game \`${gameName}\`? This cannot be undone.`,
		    			retry: message => `${us} Please enter \`yes\` or \`no\`.`,
		    			prompt: true
		    		}
		    	}
		    }
	    } else if (category == 2){

	    	let chnlStr = "";
		    let categ;
		    chnlTbl = [];
		    let x = 0;
			for (let [_,chnl] of message.guild.channels.cache){ //Find the category
				if (chnl.name.toUpperCase() == gameName.toUpperCase() && chnl.type == 'category'){
					categ = chnl;
				}
			}//Create list of channels they can choose from,
			for (let [_,chnl] of message.guild.channels.cache){ //Start with text channels so they display in the correct order
				if (chnl.parent == categ && chnl.type == 'text'){
					x++
					chnlTbl.push(chnl);
					chnlStr += `${x} - ${chnl.name}\n`;
				}
			}
			for (let [_,chnl] of message.guild.channels.cache){ 
				if (chnl.parent == categ && chnl.type == 'voice'){ //Then add voice channels
					x++
					chnlTbl.push(chnl);
					chnlStr += `${x} - ${chnl.name}\n`;
				}
			}

			channel = yield{
				type: Argument.range('integer',0,chnlTbl.length+2),
				prompt:{
					start: message => {
						embed = new Discord.MessageEmbed()
						.setTitle('Which channel do you wish to edit?')
						.setDescription(chnlStr+`${chnlTbl.length+1} - Create new channel`)
						.setFooter(`Type 'cancel' to cancel`)

						return {embed}
					},
					retry: message => `${us} Please enter a valid number`,
					prompt: true
				}
			}

			if (channel != chnlTbl.length+1){ 
				channel = chnlTbl[channel-1];

				const channelSettings = yield{
					type:Argument.range('integer',0,4),
					prompt:{
						start: message => {
							embed = new Discord.MessageEmbed()
							.setTitle(`${channel.name} Settings`)
							.setDescription(`1 - Rename Channel\n2 - Manage Permissions (Under Construction)\n3 - Delete Channel`)
							.setFooter(`Type 'cancel' to cancel`)

							return{embed};
						},
						retry: message => `${us} Please enter a valid number.`,
						prompt: true
					}
				}

				if (channelSettings == 1){
					newChName = yield{
						type: 'string',
						prompt: {
							start: message => `${us} Enter the new name for the channel`,
							retry: message => `${us} Please enter a valid name`,
							prompt: true
						}
					}
				} else if (channelSettings == 2){
					permSettings = yield{
						type: Argument.range('integer',0,4),
						prompt:{
							start: message => {
								embed = new Discord.MessageEmbed()
								.setTitle(`${channel.name} Permission Settings`)
								.setDescription(`1 - Read Messages\n2 - Send Messages\n3 - Pin/Delete Messages`)
								.setFooter(`Type 'cancel' to cancel`)
							},
							retry: message => `${us} Please enter a valid number`,
							prompt: true
						}
					}

					let players = [];
					let playerStr = `1 - ${us}`
					let x = 1;

					for (let [_,rl] of message.guild.roles.cache){
						if (rl.name == gameName){
							for ([_,mem] of rl.members){
								players.push(mem);
								x++
								playerStr += `\n${x} - ${mem.user}`
							} 
							break;
						}
					}

					newPerms = yield{
						type:Argument.range('integer',0,players.length+1,true)
					}
				} else if (channelSettings == 3){
					verifyCh = yield{
						type: 'yes/no',
						prompt:{
							start: message => `${us} Are you sure you want to delete the channel \`${channel.name}\`? This cannot be undone.`,
							retry: message => `${us} Please enter 'yes' or 'no'`,
							prompt: true
						}
					}
				}
			} else{
				name = yield{
			    	type: 'string',
			    	prompt: {
			    		start: message => `${us} What do you want to name the channel?`,
			    		retry: message => `${us} That is not a valid name`,
			    		prompt: true
			    	}
			    }

			    tv = yield{
			    	type: 'text/voice',
			    	prompt: {
			    		start: message => `${us} Do you want to create a text or a voice channel?`,
			    		retry: message => `${us} Please answer with 'text' or 'voice'.`,
			    		prompt: true
			    	}
			    }
			}
	    }

	    if (category == 1){
	    	return {gameName, newName, newDesc, newImg, newMax, newSys, verify, kickPly, verifyKick, newTime}
	    } else {
	    	return {gameName, newChName, newPerms, verifyCh, name, tv, channel}
	    }

	}
	async exec(message, args) {
		//Setup variables we will want to use a lot
		let plRole; //Player Role
		let gmRole; //GM Role
		let categ; //Game Category
		let gmMsg; //Message containing Embed for the game
		let mem = message.member; //Member of GM
		let us = message.author; //User of GM
		let gld = message.guild; //Guild
		let gmChns = []; //Array of all channels in the game

		for (let [_,rl] of gld.roles.cache){ //Find the roles for the game
			if (rl.name == args.gameName){
				plRole = rl;
			} else if (rl.name == args.gameName+' GM'){
				gmRole = rl;
			}
		}

		for (let [_,ch] of gld.channels.cache){ //Find the category for the name
			if (ch.name == args.gameName && ch.type == 'category'){
				categ = ch;
			} else if(ch.name == 'active-games' && ch.parent.name.toUpperCase() == 'ROLEPLAY'){ //Find the message with the embed
				for (let [_,msg] of ch.messages.cache){
					if (msg.embeds[0].title == args.gameName){
						gmMsg = msg;
					}
				}
			} else if (ch.parent && ch.parent.name == args.gameName){
				gmChns.push(ch);
			}
		}


		if (args.newName){
			let emb = new Discord.MessageEmbed();
			emb = gmMsg.embeds[0];
			emb.title = args.newName;
			plRole.setName(args.newName);
			gmRole.setName(args.newName+" GM");
			categ.setName(args.newName);
			gmMsg.edit(emb);

			return message.channel.send(`${us} Succesfully renamed your game.`);
		}
		if (args.newDesc){
			let emb = new Discord.MessageEmbed();
			emb = gmMsg.embeds[0];
			emb.description = args.newDesc;
			gmMsg.edit(emb);

			return message.channel.send(`${us} Successfully changed the description.`)
		}
		if (args.newImg){
			let emb = new Discord.MessageEmbed();
			emb = gmMsg.embeds[0];
			emb.setThumbnail(args.newImg);
			gmMsg.edit(emb);

			return message.channel.send(`${us} Successfully changed image.`)
		}
		if (args.newMax){
			let emb = new Discord.MessageEmbed();
			emb = gmMsg.embeds[0];
			let fld = emb.fields[1];
			let nums = fld.name.split(/\D+/);
			fld.name = `Players (${nums[1]}/${args.newMax})`;
			gmMsg.edit(emb);

			return message.channel.send(`${us} Successfully changed the max players.`)
		}
		if (args.newSys){
			let emb = new Discord.MessageEmbed();
			emb = gmMsg.embeds[0];
			let fld = emb.fields[2];
			fld.value = args.newSys;
			gmMsg.edit(emb);

			return message.channel.send(`${us} Successfully changed system.`)
		}
		if (args.newTime){
			let emb = new Discord.MessageEmbed();
			emb = gmMsg.embeds[0];
			let fld = emb.fields[3];
			fld.value = args.newTime;
			gmMsg.edit(emb);

			return message.channel.send(`${us} Successfully changed time and date.`)
		}
		if (args.verify){
			if (args.verify == 'yes'){
				await gmMsg.delete();

				for (let ch of gmChns){
					await ch.delete();
				}
				await categ.delete();
				await plRole.delete();
				await gmRole.delete();

				return message.channel.send(`${us} Your game has been successfully deleted.`);
			} else{
				return message.channel.send(`${us} Your game has not been deleted.`);
			}
		}
		if (args.tv){
			message.guild.channels.create(args.name, {
				type: args.tv,
				permissionOverwrites:[
					{
						id: plRole.id,
						allow: ['VIEW_CHANNEL']
					},
					{
						id: gmRole.id,
						allow: ['VIEW_CHANNEL']
					},
					{
						id: message.guild.roles.everyone,
						deny: ['VIEW_CHANNEL']
					}
				],
				parent: categ,
			});

			return message.channel.send(`${us} Your channel has successfully been created.`);
		}
		if (args.newChName){
			args.channel.setName(args.newChName);
			return message.channel.send(`${us} Your channel has successfully been renamed.`);
		}
		if (args.verifyCh){
			if (args.verifyCh == 'yes'){
				args.channel.delete();
				return message.channel.send(`${us} Your channel has successfully been deleted.`)
			} else {
				return message.channel.send(`${us} Your channel has not been deleted.`)
			}
		}
		if (args.kickPly){
			if (args.verifyKick == 'yes'){
				args.kickPly.roles.remove(plRole);

				for (let i of gmMsg.embeds[0].fields){
					let split = i.name.split(" ")
					if (split[0] == "Players"){ //Split[1] = (x/n), x = current players, n = max players.
						split = split[1].split(/\D/);
						let cur = parseInt(split[1]);
						let tot = parseInt(split[2]);
						cur--;
						let val = i.value.replace(`${args.kickPly.user}\n`,''); //make sure to clear the new line aswell
						val = val.replace(`${args.kickPly.user}`,''); //if there was no new line after, then it hasn't cleared the username yet
						if (val == ''){
							val = 'No Current Players';
						}

						let name = `Players (${cur}/${tot})`;
						let emb = new Discord.MessageEmbed()
						emb = gmMsg.embeds[0];
						emb.fields[1].name = name;
						emb.fields[1].value = val;
						gmMsg.edit(emb);
						
					}
				}

				return message.channel.send(`${us} Successfully kicked player ${args.kickPly.user}`)
			} else{
				return message.channel.send(`${us} Player was not kicked.`)
			}
		}
	}
}

module.exports = rpEditCommand;