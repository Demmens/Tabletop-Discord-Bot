const path = require('path');
const fs = require('fs');

const conditions = [
	{
		name: 'burn',
		emote: '🔥',
		text: [
			`CULTIST takes DMG damage from the burn`
		],
		shouldEnd: false,
		potency: 1,
		duration: 1,
		timer: 0,
		trigger: function(char){
			char.hp -= this.potency;
			if (char.hp <= 0) this.text = ['CULTIST burned to death.'];
		},
		endCondition: function(char){
			if (this.timer >= this.duration) return true;
		}
	},
	{
		name: 'bleed',
		emote: '🩸',
		text: [
			`CULTIST takes DMG damage from the bleed.`
		],
		shouldEnd: false,
		potency: 1,
		timer: 0,
		duration: 1,
		trigger: function(char){
			char.hp -= this.potency;
			if (char.hp <= 0) this.text = ['CULTIST bled to death.'];
		},
		endCondition: function(char){
			if (this.timer >= this.duration) return true;
		}
	},
	{
		name: 'poison',
		emote: '🩸',
		text: [
			`CULTIST takes DMG from the poison.`
		],
		shouldEnd: false,
		potency: 1,
		timer: 0,
		duration: 1,
		trigger: function(char){
			char.hp -= this.potency;
			this.potency--;
			if (char.hp <= 0) this.text = ['CULTIST died of poison'];
		},
		endCondition: function(char){
			if (this.timer >= this.duration) return true;
		}
	},
	{
		name: 'fear',
		emote: '👻',
		text: [
			`CULTIST is too afraid to move.`,
			`CULTIST is paralyzed by fear.`
		],
		shouldEnd: true,
		timer: 0,
		duration: 1,
		trigger: function(char){
		},
		endCondition: function(char){
			if (this.timer >= this.duration) return true;
		}
	},
	{
		name: 'stun',
		emote: '✴️',
		text: [
			`CULTIST is stunned`
		],
		shouldEnd: true,
		timer: 0,
		duration: 1,
		trigger: function(char){
		},
		endCondition: function(char){
			if (this.timer >= this.duration) return true;
		}
	}
]

module.exports = conditions;