module.exports = {

	//|-----------------|//
	//|General Functions|//
	//|-----------------|//

	//Return a random item from an array
	arrRandom: function(arr){
		let num = Math.floor(Math.random()*arr.length);
		return arr[num];
	},

	//Randomise an array
	arrRandomise: function(arr){
		let newArr = [];
		while (arr.length > 0){
			let k = Math.floor(Math.random()*arr.length);
			let v = arr[num];
			arr.splice(k,1)
			newArr.push(v);
		}
		return newArr;
	},

	//Replace hyphens and underscores with spaces
	replaceHyphens: function(str){
		let splt = str.split(/[_|-]/);
		let msg = "";
		for(let i of splt){
			msg += i;
		}
		return msg;
	},

	//Separate thousands by commas in a number
	numberWithCommas: function(x) {
	    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	},

	//Remove array index by value
	removeA: function(arr) {
	    var what, a = arguments, L = a.length, ax;
	    while (L > 1 && arr.length) {
	        what = a[--L];
	        while ((ax= arr.indexOf(what)) !== -1) {
	            arr.splice(ax, 1);
	        }
	    }
	    return arr;
	},

	//|----------------------------------|//
	//|Random Number Generation Functions|//
	//|----------------------------------|//

	//roll dice and return highest result
	highest: function(dice, number){
		let roll = 0;
		let cur = 0;
		for (let i=0;i<number;i++){
			cur = Math.ceil(Math.random()*dice);
			if (cur > roll){
				roll = cur;
			}
		}

		return roll;
	},

	//roll dice and return lowest result
	lowest: function(dice, number){
		let roll = Number.MAX_SAFE_INTEGER;
		let cur = 0;
		for (let i=0;i<number;i++){
			cur = Math.ceil(Math.random()*dice);
			if (cur < roll){
				roll = cur;
			}
		}

		return roll;
	},

	// Standard Normal variate using Box-Muller transform.
	randn_bm: function() {
	    var u = 0, v = 0;
	    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
	    while(v === 0) v = Math.random();
	    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
	}
	
}