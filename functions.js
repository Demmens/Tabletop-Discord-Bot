module.exports = {
	replaceHyphens: function(str){
		let splt = str.split(/[_|-]/);
		let msg = "";
		for(let i of splt){
			msg += i;
		}
		return msg;
	}

}