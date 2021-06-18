const { Command } = require("discord-akairo");
const f = require('../../../functions.js');
const fs = require('fs');
const Discord = require("discord.js");

class BoggleCommand extends Command {
	constructor() {
		super("boggle", {
			aliases: ["boggle"],
			args: [],
			description: "Play a game of boggle!"
		});
	}
	async exec(message, args) {
		let data = fs.readFileSync('./Commands/Games/Boggle/words.txt', {encoding: 'utf8'});
		let words = data.replace(/\r/gi, '').split('\n');
		const emojis = {
	        a: '🇦', b: '🇧', c: '🇨', d: '🇩',
	        e: '🇪', f: '🇫', g: '🇬', h: '🇭',
	        i: '🇮', j: '🇯', k: '🇰', l: '🇱',
	        m: '🇲', n: '🇳', o: '🇴', p: '🇵',
	        q: '🇶', r: '🇷', s: '🇸', t: '🇹',
	        u: '🇺', v: '🇻', w: '🇼', x: '🇽',
	        y: '🇾', z: '🇿', 0: '0⃣', 1: '1⃣',
	        2: '2⃣', 3: '3⃣', 4: '4⃣', 5: '5⃣',
	        6: '6⃣', 7: '7⃣', 8: '8⃣', 9: '9⃣',
	        10: '🔟', '#': '#⃣', '*': '*⃣',
	        '!': '❗', '?': '❓', '+': '➕',
	        '-': '➖', '$': '💲', '>': '▶️',
	        '<': '◀️', ' ': ' '
	    }
		let dice = [
			"R I F O B X",
			"I F E H E Y",
			"D E N O W S",
			"U T O K N D",
			"H M S R A O",
			"L U P E T S",
			"A C I T O A",
			"Y L G K U E",
			"Q B M J O A",
			"E H I S P N",
			"V E T I G N",
			"B A L I Y T",
			"E Z A V N D",
			"R A L E S C",
			"U W I L R G",
			"P A C E M D"
		];

		let diceOrder = f.arrRandomise(dice);

		let msg = "";
		let num = 0;
		let boggleArray = [];
		for (let die of diceOrder)
		{
			let letterArr = die.split(" ");
			let ranLetter = f.arrRandom(letterArr).toLowerCase();
			msg += emojis[ranLetter] + " ";
			boggleArray.push(ranLetter);
			num++;
			if (num == 4)
			{
				num = 0;
				msg += "\n";
			}
		}

		function FindWordsWithStart(section, loop, checkIndex) //Run through the words list and find any words starting with a particular string.
		{
			let arr = [];
			let word = words[checkIndex].toLowerCase();
			if (word.startsWith(section)) //Found words that start with the current letters
			{
				let i = checkIndex;
				while (word.startsWith(section)) //Find all words before that also start with those letters
				{
					arr.push(word);
					i--;
					word = words[i].toLowerCase();
				}
				i = checkIndex+1;
				word = words[i];
				while (word.startsWith(section)) //Find all words after that also start with those letters
				{
					arr.push(word);
					i++;
					word = words[i].toLowerCase();
				}
				return arr; //Return the array of all words that start with the given letters
			}
			else 
			{
				if (loop == 22) //Should only need 19 loops, but put 22 to be safe.
				{
					return arr;
				}
				loop++;
				let nextIndex;
				if (word > section){
					nextIndex = checkIndex-Math.floor(words.length/Math.pow(2,loop));
					if (nextIndex == checkIndex) nextIndex == checkIndex - 1
				}
				else
				{
					nextIndex = checkIndex+Math.floor(words.length/Math.pow(2,loop));
					if (nextIndex == checkIndex) nextIndex == checkIndex + 1
				}
				return FindWordsWithStart(section, loop, nextIndex);
			}
		}

		function AddLetter(index, unused, word)
		{
			let i = 0;
			let unusedindex = -1;
			for (let letter of unused)
			{
				unusedindex++;
				if (letter == boggleArray[index] && unusedindex == index) // Make sure we don't use the same letter twice
				{
					word += letter;
					if (letter == "q") word += "u";
					if (word.length > 1)
					{
						let potentialWords = FindWordsWithStart(word,1,Math.floor(words.length/2)); //Find all words that begin with the given letters
						if (potentialWords.length == 0) break; //If there are no words that start with those letters, we can stop our search of this tree here.
						if (potentialWords.includes(word)) //If the given letters are actually a full word...
						{
							let alreadyFound = false;
							for (let wrd of possibleWordsArr) //Check if we've already found the word
							{
								if (wrd == word){
									alreadyFound = true;
								}
							}
							if (!alreadyFound) //If we haven't found this word yet
							{
								possibleWordsArr.push(word); //Save it so we don't get duplicates later.
							}
							if (potentialWords.length == 1) break; //If there is only one possible word beginning with these letters, we need look no further.
						}
					}					
					unused[i] = "used";
					let topRow = true;
					let bottomRow = true;
					let leftCol = true;
					let rightCol = true;
					let connectedTo = [];
					if (index % 4 != 0) // Has letters to the left
					{
						connectedTo.push(index-1);
						leftCol=false;
					}
					if (index % 4 != 3) // Has letters to the right
					{
						connectedTo.push(index+1);
						rightCol=false;
					}
					if (index > 3) // Has letters above
					{
						connectedTo.push(index-4);
						topRow=false;
					}
					if (index < 12)// Has letters below
					{
						connectedTo.push(index+4);
						bottomRow=false
					}
					if (!topRow && !leftCol)// Has letter up/left
					{
						connectedTo.push(index-5);
					}
					if (!topRow && !rightCol)// Has letter up/right
					{
						connectedTo.push(index-3);
					}
					if (!bottomRow && !leftCol)// Has letter down/left
					{
						connectedTo.push(index+3);
					}
					if (!bottomRow && !rightCol)// Has letter down/right
					{
						connectedTo.push(index+5);
					}
					
					let connn = `${boggleArray[index]} is connected to: `;
					for (let con of connectedTo) // For all connecting letters
					{
						AddLetter(con, JSON.parse(JSON.stringify(unused)), word); // Test the add the letter to the current string, test for matches
						connn+= `${boggleArray[con]}, `;
					}
					break;
				}
				i++;
			}
		}

		var possibleWordsMsg = "";
		var possibleWordsArr = [];
		for (let j=0;j<16;j++)
		{
			AddLetter(j,JSON.parse(JSON.stringify(boggleArray)),"");
		}
		possibleWordsArr.sort((a,b) => {
			if (a.length > b.length) return -1;
			if (a.length < b.length) return 1;
			if (a.length == b.length)
			{
				if (a>b) return 1;
				if (a<b) return -1;
			}
		});
		for (let i = 0;i < possibleWordsArr.length;i++)
		{
			let posWord = possibleWordsArr[i];
			if (posWord.length > 2)
			{
				if (i == 0)
				{
					possibleWordsMsg += `**${posWord.length} LETTER WORDS**\n`;
				}
				else if (posWord.length < possibleWordsArr[i-1].length)
				{
					possibleWordsMsg += `**${posWord.length} LETTER WORDS**\n`;
				}	
				possibleWordsMsg += `${posWord}\n`;
			}
		}
		let timeUp = false;
		message.channel.send(msg);

		setTimeout(function(){
			fs.writeFileSync("./Commands/Games/Boggle/SPOILER_FILE.txt", possibleWordsMsg);
			timeUp=true;

			if (scores.length != 0)
			{
				let scoreDesc = "";
				scores.sort((a,b) => {return b-a});
				for (let score of scores)
				{
					scoreDesc += `${score.player.user} - ${score.score}\n`
				}
				let emb = new Discord.MessageEmbed()
				.setDescription(scoreDesc)
				.setTitle("**SCORES**");
				message.channel.send(emb);
			}
			message.channel.send({
				content:`**${possibleWordsArr.length} possible words**:`,
				files:["./Commands/Games/Boggle/SPOILER_FILE.txt"]
			});
		},60000);

		let guessedWords = [];
		let scores = [];

		let wordValues = {
			3:1,
			4:1,
			5:2,
			6:3,
			7:5,
			8:11
		}

		function guessWord(message)
		{
			let ply = message.member;
			let word = message.content.toLowerCase();
			console.log(word);
			if (!guessedWords.includes(word) && possibleWordsArr.includes(word)) //Correct guess
			{

				let hasUser = false;
				guessedWords.push(word);
				possibleWordsMsg = possibleWordsMsg.replace(`\n${word}\n`, `\n${word} (${message.member.displayName})\n`);
				let wordlength = Math.min(8,word.length);
				console.log(`word length: ${wordlength}`);
				console.log(`score: ${wordValues[wordlength]}`);
				for (let score of scores)
				{
					if (score.player == ply)
					{
						hasUser = true;
						score.score += wordValues[wordlength];
						console.log(score.score);
					}
				}
				if (!hasUser)
				{
					scores.push({
						player: ply,
						score: wordValues[wordlength]
					})
				}
			}

			if (message.author.id != 708801223083556898)
			{
				message.delete();
			}
		}

		while (!timeUp)
		{
			let filter = m => !m.content.includes(" ");
            let guess = await message.channel.awaitMessages(filter, { max: 1, time: 45*1000});

			guessWord(guess.first());
		}
	}
}

module.exports = BoggleCommand;