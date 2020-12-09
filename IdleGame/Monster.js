const path = require('path');
const fs = require('fs');

class Monster {
	constructor(options = {}){
		const {
			name = '', //Name
			plural = null, //Plural name
			hp = 1, //Health
			defence = 1,
			minNumber = 1, //Min number of monsters that can spawn
			maxNumber = 1, //Max number of monsters that can spawn
			speed = 0, //How early in initiative the monster goes
			weaknesses = [], //Damage types the monster is weak to
			resistances = [], // Damage types the monster resists
			level = 0, //Level combats the monster appears in.
			emote = '💢', //Emote for combat log.
			turns = 1, //Number of attacks per round the monster has.
			attacks = [], //Attacks
			drops = [], //Loot
		} = options;
		this.name = name;
		this.plural = plural || name+'s';
		this.hp = hp;
		this.defence = defence;
		this.minNumber = minNumber;
		this.maxNumber = maxNumber;
		this.speed = speed;
		this.weaknesses = weaknesses;
		this.resistances = resistances;
		this.level = level;
		this.emote = emote;
		this.turns = turns;
		this.attacks = attacks;
		this.drops = drops;
	}

	getName(){
		return this.name;
	}
	setName(name){
		this.name = name;
	}

	getPlural(){
		return this.plural;
	}
	setPlural(plural){
		this.plural = plural;
	}

	getHealth(){
		return this.hp;
	}
	setHealth(health){
		this.hp = health;
	}

	getMinNumber(){
		return this.minNumber;
	}
	setMinNumber(minNumber){
		this.minNumber = minNumber;
	}

	getMaxNumber(){
		return this.maxNumber;
	}
	setMaxNumber(maxNumber){
		this.maxNumber = maxNumber;
	}

	getSpeed(){
		return this.speed;
	}
	setSpeed(){
		this.speed = speed;
	}

	getWeaknesses(){
		return this.weaknesses;
	}
	addWeakness(weakness){
		this.weaknesses.push(weakness);
	}
	removeWeakness(weakness){
		let x=0;
		for (let weak of this.weaknesses){
			if (weak == weakness) this.weaknesses.splice(x,1);
			x++
		}
	}

	getResistances(){
		return this.resistances;
	}
	addResistance(resistance){
		this.resistances.push(resistance);
	}
	removeResistance(resistance){
		let x=0;
		for (let res of this.resistances){
			if (res == resistance) this.resistances.splice(x,1);
			x++
		}		
	}

	getLevel(){
		return this.level;
	}
	setLevel(level){
		this.level = level;
	}

	getEmote(){
		return this.emote;
	}
	setEmote(emote){
		this.emote = emote;
	}

	getTurns(){
		return this.turns;
	}
	setTurns(turns){
		this.turns = turns;
	}
}

module.exports = Monster;