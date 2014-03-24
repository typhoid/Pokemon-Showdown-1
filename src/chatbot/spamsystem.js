exports.canTalk = function (user, room, connection, message) {
    global.today = new Date();
    if ((today.getMinutes() - user.o3omessagetime) < 0) {
        user.o3omessagetime = today.getMinutes();
    }
    if ((today.getMinutes() - user.o3omessagetime) > 1 || (today.getMinutes() - user.o3omessagetime) === 1) {
        user.o3omessagetime = today.getMinutes();
        user.numMessages = 0;
    }
    user.numMessages += 1;

    if (bot.BannedStuff(message) === true) {
        user.lock();
        room.add('|html|<font color="#FF00BF"><i><b>' + bot.name + '</b> locked ' + user.name + '(somthing bad :P).</i></font>');
        return false;
    }
	
    if (user.numMessages == 15) {
        user.mute(room.id, 7 * 60 * 1000);
        room.add('|html|<font color="#FF00BF"><i><b>' + bot.name + '</b> has muted ' + user.name + ' for 7 minutes(flood).</i></font>');
        user.o3omessagetime = today.getMinutes();
        user.numMessages = 0;
        return false;
    }
    if (bot.spammers.indexOf(user.userid) > -1) {
        spamroom[user.userid] = true;
        return false;
    }
  
  //caps
			var alpha = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
			for (var i=0;i<alpha.length;i++) {
				if(message.indexOf(alpha[i]) >= 0) {
					if (message === message.toUpperCase() && message.toUpperCase >= 6) {
						room.add('|c|'+ user.name+'|'+message);
						user.warnCounter+
						room.add('|html|<font color="#FF00BF">'+user.name+' was warned by '+'<i><b> Rain Bot </b> '+'.' +  ' (caps)</i></font>');
						user.send('|c|~|/warn '+'caps');
						return false;
					}
				}
			}
			
    if (user.warnCounters > 4) {
        room.add('|html|<font color="#FF00BF">' + user.name + ' was muted by ' + '<i><b>' + bot.name + '</b>(more than 4 warnings)</i></font>');
        user.mute(room.id, 60 * 60 * 1000, true);
        return false;
    }
    if (spamroom[user.userid]) {
        Rooms.rooms.spamroom.add('|c|' + user.getIdentity() + '|' + message);
        connection.sendTo(room, "|c|" + user.getIdentity() + "|" + message);
        return false;
    }
    if (message.toLowerCase().indexOf(".psim") > -1) {
        connection.sendTo(room, '|raw|<strong class=\"message-throttle-notice\">Advertising is not allowed please do not.</strong>');
        return false;
        user.warnCounters += 1;
        room.add('|html|<font color="#FF00BF">' + user.name + ' was warned by ' + '<i><b>' + bot.name + '</b>(advertising)</i></font>');
        user.send('|c|~|/warn advertising');
    }

    if (message.toLowerCase().indexOf("play.pokemonshowdown.com") > -1) {
        connection.sendTo(room, '|raw|<strong class=\"message-throttle-notice\">Advertising is not allowed please do not.</strong>');
        return false;
        user.warnCounters += 1;
        room.add('|html|<font color="#FF00BF">' + user.name + ' was warned by ' + '<i><b>' + bot.name + '</b>(advertising)</i></font>');
        user.send('|c|~|/warn advertising');
    }

    if (message.toLowerCase().indexOf("psim") > -1) {
        connection.sendTo(room, '|raw|<strong class=\"message-throttle-notice\">Advertising is not allowed please do not.</strong>');
        return false;
        user.warnCounters += 1;
        room.add('|html|<font color="#FF00BF">' + user.name + ' was warned by ' + '<i><b>' + bot.name + '</b>(advertising)</i></font>');
        user.send('|c|~|/warn advertising');
    }
    if (message.toLowerCase().indexOf("ps im") > -1) {
        connection.sendTo(room, '|raw|<strong class=\"message-throttle-notice\">Advertising is not allowed please do not.</strong>');
        return false;
        user.warnCounters += 1;
        room.add('|html|<font color="#FF00BF">' + user.name + ' was warned by ' + '<i><b>' + bot.name + '</b>(advertising)</i></font>');
        user.send('|c|~|/warn advertising');
    }
    if (message.toLowerCase().indexOf("psi m") > -1) {
        connection.sendTo(room, '|raw|<strong class=\"message-throttle-notice\">Advertising is not allowed please do not.</strong>');
        return false;
        user.warnCounters += 1;
        room.add('|html|<font color="#FF00BF">' + user.name + ' was warned by ' + '<i><b>' + bot.name + '</b>(advertising)</i></font>');
        user.send('|c|~|/warn advertising');
    }
    if (message.toLowerCase().indexOf("p sim") > -1) {
        connection.sendTo(room, '|raw|<strong class=\"message-throttle-notice\">Advertising is not allowed please do not.</strong>');
        return false;
    }
    if (message.toLowerCase().indexOf(".prism") > -1) {
        connection.sendTo(room, '|raw|<strong class=\"message-throttle-notice\">Advertising is not allowed please do not.</strong>');
        return false;
        user.warnCounters += 1;
        room.add('|html|<font color="#FF00BF">' + user.name + ' was warned by ' + '<i><b>' + bot.name + '</b>(caps)</i></font>');
        user.send('|c|~|/warn caps');
    }
    unspam: 'unspamroom',
	unspammer: 'unspamroom',
	unspamroom: function(target, room, user, connection) {
		var target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser || !targetUser.connected) {
			return this.sendReply('The user \'' + this.targetUsername + '\' does not exist.');
		}
		if (!this.can('mute', targetUser)) {
			return false;
		}
		if (!spamroom[targetUser]) {
			return this.sendReply('That user is not in the spamroom list.');
		}
		for(var u in spamroom)
			if(targetUser == Users.get(u))
				delete spamroom[u];
		Rooms.rooms['randomasdfjklspamhell'].add('|raw|<b>' + this.targetUsername + ' was removed from the spamroom list.</b>');
		this.logModCommand(targetUser + ' was removed from spamroom by ' + user.name);
		return this.sendReply(this.targetUsername + ' and their alts were successfully removed from the spamroom list.');
	},
	spam: 'spamroom',
	spammer: 'spamroom',
	spamroom: function(target, room, user, connection) {
		if (!target) return this.sendReply('Please specify a user.');
		var target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser || !targetUser.connected) {
			return this.sendReply('The user \'' + this.targetUsername + '\' does not exist.');
		}
		if (!this.can('mute', targetUser)) {
			return false;
		}
		if(!Rooms.rooms.spamroom){
this.parse('/makechatroom randomasdfjklspamhell');
Rooms.rooms.randomasdfjklspamhell.isPrivate = true;
}
		if (spamroom[targetUser]) {
			return this.sendReply('That user\'s messages are already being redirected to the spamroom.');
		}
		spamroom[targetUser] = true;
		Rooms.rooms['randomasdfjklspamhell'].add('|raw|<b>' + this.targetUsername + ' was added to the spamroom list.</b>');
		this.logModCommand(targetUser + ' was added to spamroom by ' + user.name);
		return this.sendReply(this.targetUsername + ' was successfully added to the spamroom list.');
	},
	if (user.userid in spamroom) {
			this.sendReply('|c|' + user.getIdentity() + '|' + message);
			return Rooms.rooms['randomasdfjklspamhell'].add('|c|' + user.getIdentity() + '|' + message);
			
		} else {
			return message;
		}
	}
};
