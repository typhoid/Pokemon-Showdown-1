exports.cmds = {
	rock: function(target,room, user) {return this.parse('/rps rock ' + target);},
	paper: function(target,room, user) {return this.parse('/rps paper ' + target);},
	scissors: function(target,room, user) {return this.parse('/rps scissors ' + target);},
	lizard: function(target,room, user) {return this.parse('/rps lizard ' + target);},
	spock: function(target,room, user) {return this.parse('/rps Spock ' + target);},

	rps: function(target, room, user) {
		user.blockrps=false;
		var parts = target.split(",");
		var spind = target.indexOf(" ");
		var blankarray = ["blank","no","none","nothing","void"]
		var lcasearray = ["rock","paper","scissors","lizard","spock"]


		if (!parts[0]) return this.sendReply("The proper syntaxis is /rps [choice],[targetuser]. The parameter [targetuser] is optional.");

		if (blankarray.indexOf(parts[0].toLowerCase()) != -1) {
			user.rpschoice = "";
			return this.sendReply("Your previous choice has been deleted.");
		}
		if (lcasearray.indexOf(parts[0].toLowerCase()) != -1) {
			user.rpschoice = parts[0];
		}
		else if (lcasearray.indexOf(target.substr(0, spind).toLowerCase()) != -1 ) {
			//this.sendReply("The proper syntaxis is /rps [choice],[targetuser]. The parameter [targetuser] is optional.");
			parts[0] = target.substr(0, spind);
			user.rpschoice = parts[0];
			parts[1] = target.substr(spind+1,target.length - spind - 1);
		}
		else
		{
			return this.sendReply("Want it or not, your choice is invalid! The proper syntaxis is /rps [choice],[targetuser].");
		}
		var targetuser =  Users.get(parts[1]);
		if (targetuser === null) {
			if(user.rpschallengedby === "" || !user.rpschallengedby) return this.sendReply("Your choice has been set to " + user.rpschoice + ".");
			this.parse('/rps '+parts[0]+","+user.rpschallengedby);
			return user.rpschallengedby = "";
		}
		else if (targetuser === undefined) {
			return this.sendReply("Your choice has been set to " + user.rpschoice + " but your opponent is not online or doesn't exist.");
		}
		if(targetuser == user) return this.sendReply("Your choice has been set to " + user.rpschoice + ", but remember that you can't play against yourself!");
		if (targetuser.blockrps) return this.sendReply("Your choice has been set to " + user.rpschoice + ". However, your opponent is currently blocking challenges to this game.");
		if (!targetuser.rpschoice || targetuser.rpschoice === "") {
			if (targetuser.popped) {
				targetuser.send(user.name+" has challenged you to a RPS-lizard-Spock game. Use the command /rps to play.")
			}
			else {
				targetuser.popped = true
				targetuser.popup(user.name+" has challenged you to a rock-paper-scissors-lizard-Spock game. Use the command /rps to play.");
			}
			targetuser.rpschallengedby = user;
			return this.sendReply("Your choice has been set to " + user.rpschoice + ". Hope that " + targetuser.name + " shoots " + getRPShope(user.rpschoice) + ".");
		}
		var msg = getRPSmsg(user.name,targetuser.name,user.rpschoice,targetuser.rpschoice);
		user.rpschoice = "";
		targetuser.rpschoice = "";
		if(user.can('broadcast') || targetuser.can('broadcast')) {
			return this.add(msg);
		}
		else {
			targetuser.send(msg);
			return this.sendReply(msg);
		}
	},
	
	disallowrps: 'blockrps',
	blockrps: function(target,room,user) {
		user.blockrps=true;
		return this.sendReply('RPS Challenges are now blocked.');
	},

	unblockrps: 'allowrps',	
	allowrps: function(target,room,user) {
		user.blockrps=false;
		return this.sendReply('RPS Challenges are now allowed.');
	},

// end rps commands
};
