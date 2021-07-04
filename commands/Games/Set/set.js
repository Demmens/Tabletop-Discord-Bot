const { Command } = require("discord-akairo");
const f = require('../../../functions.js');
const Discord = require("discord.js");

class SetCommand extends Command {
	constructor() {
		super("set", {
			aliases: ["set"],
			args: [],
			description: "Match a set of 3"
		});
	}
	async exec(message, args) {
		let emojis = {};
        let emojinum = {
            0:'1⃣', 1:'2⃣', 2:'3⃣'
        }
        let alphanumeric = {
            "a":0,"s":1,"d":2,"f":3,"g":4,"h":5
        }
        let emojiLetters = {
            0: '🇦', 1: '🇸',
            2: '🇩', 3: '🇫',
            4: '🇬', 5: '🇭'
        }
        for (let [_,guild] of this.client.guilds.cache) // Register all set-related emojis
        {
            if (guild.id == 769106198951493643 || guild.id == 801089240829394973)
            {
                for (let [_,emoji] of guild.emojis.cache)
                {
                    if ((emoji.name.startsWith(1)||emoji.name.startsWith(2)||emoji.name.startsWith(3)) && emoji.name.length == 4)
                    {
                        emojis[emoji.name] = emoji;
                    }
                }
            }
        }
      
        let numbers = ["1","2","3"];
        let shades = ["h","s","b"];
        let colours = ["r","g","p"];
        let shapes = ["d","s","o"];
        let categories = [numbers,shades,colours,shapes];

        let deck = [];
        for (let num of numbers) //Create complete list of possible cards
        {
            for (let shade of shades)
            {
                for (let col of colours)
                {
                    for (let shape of shapes)
                    {
                        deck.push(num+shade+col+shape);
                    }
                }
            }
        }
        deck = f.arrRandomise(deck); // Shuffle the deck

        let board = [];
        let rows = [];
        let row = [];
        for (let i = 0; i < 12; i++) // Set up the board
        {
            board.push(deck[0]);
            row.push(deck[0]);
            deck.splice(0,1);
            if (i%4==3) 
            {
                rows.push(row);
                row = [];
            }
        }

        let gameMessage = await message.channel.send("Starting game...");
        let emb = new Discord.MessageEmbed()
        .setTitle("**SCORES**")
        .setDescription("");
        let scoreMessage = await message.channel.send(emb);

        let cardsWithSets = [];
        let scores = [];
        ensureSetOnBoard();

        let regex = new RegExp(`[a-z][1-3][a-z][1-3][a-z][1-3]`);

        let startTime = new Date().getTime();
        while (deck.length != 0 || boardHasSet())
        {
            let filter = m => regex.test(m.content);
            let msg = (await message.channel.awaitMessages(filter, { max: 1, time: 45*60000})).first();
            let guess = convertMessageToCoords(msg.content);
            let set = [];
            for (let coord of guess)
            {
                set.push(rows[coord[1]][coord[0]]);
            }
            set.sort((a,b) => {if (a>b){ return 1} else return -1});
            if (isSet(set))
            {
                let hasScore = false;
                for (let score of scores)
                {
                    if (score.member == msg.member)
                    {
                        hasScore = true;
                        score.score++;
                        score.lastGuess = `${emojis[set[0]]} ${emojis[set[1]]} ${emojis[set[2]]}`;
                    }
                }
                if (!hasScore)
                {
                    scores.push({
                        member: msg.member,
                        score:1,
                        lastGuess: `${emojis[set[0]]} ${emojis[set[1]]} ${emojis[set[2]]}`
                    })
                }

                guess.sort((a,b) => { //sort so we don't have any problems with indexes moving
                    return b[0]-a[0];
                });
                for (let coord of guess) //Remove the guessed cards from the board
                {
                    for (let i=0;i<board.length;i++)
                    {
                        if (board[i] == rows[coord[1]][coord[0]])
                        {
                            board.splice(i,1);
                            i--;
                        }
                    }
                    rows[coord[1]].splice(coord[0],1);
                }

                if (board.length > 9 || deck.length == 0) // If we have 12 or more cards or the deck is empty, we don't add cards, we just neaten up the rows.
                {
                    for (let row of rows)
                    {
                        while (row.length > board.length/3) //if the row has more cards than it should
                        {
                            for (let row2 of rows)
                            {
                                if (row2.length < board.length/3) //add it to the row with fewer cards than it should
                                {
                                    row2.push(row[row.length-1]);
                                    row.splice(row.length-1,1);
                                }
                            }
                        }
                    }
                }
                else
                {
                    for (let row of rows)
                    {
                        while (row.length < 4)
                        {
                            row.push(deck[0]);
                            board.push(deck[0]);
                            deck.splice(0,1);
                        }
                    }
                }
                updateChatMessage();
                ensureSetOnBoard();
            }
            await msg.delete();
        }
        let endTime = new Date().getTime();
        let gameTime = endTime - startTime;
        let seconds = Math.floor(gameTime/1000)%60;
        let minutes = Math.floor(gameTime/60000);
        let miliseconds = gameTime%1000;
        while (miliseconds.toString().length < 3)
        {
            miliseconds = `0${miliseconds}`;
        }
        if (seconds.toString().length < 2)
        {
            seconds = `0${seconds}`;
        }
        let isRecord = false;
        for (let [_,pin] of await message.channel.messages.fetchPinned())
        {
            if (pin.content.startsWith("**GAME OVER**"))
            {
                let time = pin.content.slice(20).split("\n")[0].split(":");
                console.log(time);
                let oldRecord = (parseInt(time[0])*60000) + (parseInt(time[1])*1000) + parseInt(time[2]);
                console.log(oldRecord);
                console.log(gameTime);
                if (gameTime < oldRecord)
                {
                    isRecord = true;
                    await pin.unpin();
                }
            }
        }
        let gameOverMessage = `**GAME OVER**\nTime: ${minutes}:${seconds}:${miliseconds}`;
        if (isRecord)
        {
            gameOverMessage += `\n**NEW RECORD**`;
        }
        let finalMessage = await message.channel.send(gameOverMessage);
        if (isRecord) finalMessage.pin();

        function updateChatMessage()
        {
            let msg = ``;
            let i = 0;
            for (let row of rows)
            {
                msg += `\n${emojinum[2-i]}`;
                i++;
                for (let card of row)
                {
                    msg += `${emojis[card]} `;
                }
                
            }
            msg += "\n<:Blank:856877780553302056>";
            for (let i = 0;i<board.length/3;i++)
            {
                msg+=`${emojiLetters[i]} `;
            }
            if (scores.length > 0)
            {
                let scoreMsg = "";
                for (let score of scores)
                {
                    scoreMsg += `${score.member.user} - ${score.score} - ${score.lastGuess}\n`;
                }
                let emb = new Discord.MessageEmbed()
                .setTitle("**SCORES**")
                .setDescription(scoreMsg);
                scoreMessage.edit(emb);
            }
            gameMessage.edit(msg);
        }

        function isSet(selected)
        {
            if (selected[1] == findThirdCard([selected[0],selected[2]]) && selected[1] != selected[2])return true;
            return false;
        }

        function findThirdCard(pair)
        {
            let card1 = pair[0].split("");
            let card2 = pair[1].split("");
            let thirdCard = "";
            for (let i = 0;i<4;i++)
            {
                if (card1[i] == card2[i]) thirdCard += card1[i];
                else
                {
                    for (let categ of categories[i])
                    {
                        if (categ != card1[i] && categ != card2[i]) thirdCard += categ;
                    }
                }
            }

            return thirdCard;
        }

        function boardHasSet()
        {
            let unchecked = [...board];
            let hasSet = false;
            for (let card1 of board)
            {
                unchecked.splice(0,1);
                for (let card2 of unchecked)
                {
                    let card3 = findThirdCard([card1,card2])
                    if (board.includes(card3)) 
                    {
                        console.log(`Set found with ${card1},${card2},${card3}`);
                        if (!cardsWithSets.includes(card1)) cardsWithSets.push(card1);
                        if (!cardsWithSets.includes(card2)) cardsWithSets.push(card2);
                        if (!cardsWithSets.includes(card3)) cardsWithSets.push(card3);
                        hasSet = true;
                    }
                }
            }
            return hasSet;
        }

        function ensureSetOnBoard()
        {
            if (!boardHasSet())
            {
                if (deck.length == 0) return;
                console.log("board has no set.");
                for (let row of rows)
                {
                    row.push(deck[0]);
                    board.push(deck[0]);
                    deck.splice(0,1);
                }
                ensureSetOnBoard();
            } else updateChatMessage();
        }    
        
        function convertMessageToCoords(str)
        {
            let letters = str.split("");
            let obtainedCoords = [];
            for (let i = 0;i<6;i+=2)
            {
                let col = alphanumeric[letters[i]];
                let row = 3-letters[i+1];
    
                obtainedCoords.push([col,row]);
            }
            return obtainedCoords;
        }
	}
}

module.exports = SetCommand;