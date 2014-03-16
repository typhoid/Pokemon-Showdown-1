/**
 * Command parser
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * This is the command parser. Call it with CommandParser.parse
 * (scroll down to its definition for details)
 *
 * Individual commands are put in:
 *   commands.js - "core" commands that shouldn't be modified
 *   config/commands.js - other commands that can be safely modified
 *
 * The command API is (mostly) documented in config/commands.js
 *
 * @license MIT license
 */

/*

To reload chat commands:

/hotpatch chat

*/

const MAX_MESSAGE_LENGTH = 300;

const BROADCAST_COOLDOWN = 20*1000;

const MESSAGE_COOLDOWN = 5*60*1000;

const MAX_PARSE_RECURSION = 10;

var crypto = require('crypto');

var modlog = exports.modlog = {lobby: fs.createWriteStream('logs/modlog/modlog_lobby.txt', {flags:'a+'}), battle: fs.createWriteStream('logs/modlog/modlog_battle.txt', {flags:'a+'})};

/**
 * Command parser
 *
 * Usage:
 *   CommandParser.parse(message, room, user, connection)
 *
 * message - the message the user is trying to say
 * room - the room the user is trying to say it in
 * user - the user that sent the message
 * connection - the connection the user sent the message from
 *
 * Returns the message the user should say, or a falsy value which
 * means "don't say anything"
 *
 * Examples:
 *   CommandParser.parse("/join lobby", room, user, connection)
 *     will make the user join the lobby, and return false.
 *
 *   CommandParser.parse("Hi, guys!", room, user, connection)
 *     will return "Hi, guys!" if the user isn't muted, or
 *     if he's muted, will warn him that he's muted, and
 *     return false.
 */
var parse = exports.parse = function(message, room, user, connection, levelsDeep) {
var comd = '';
    var otarget = '';
	var bot = require('./stuff/chatbot/bot.js').bot();
    if (message.substr(0, 2) !== (bot.commandchar + bot.commandchar) && message.substr(0, 1) === bot.commandchar) {
        var e3espaceIndex = message.indexOf(' ');
        if (e3espaceIndex > 0) {
            comd = message.substr(1, e3espaceIndex - 1);
            otarget = message.substr(e3espaceIndex + 1);
        } else {
            comd = message.substr(1);
            otarget = '';
        }
    }
    var otherhandler = bot.cmds[comd];
    if (typeof commandHandler === 'string') {
        // in case someone messed up, don't loop
        otherhandler = bot.cmds[otherhandler];
    }
    if (otherhandler) {
        var othercontext = {
            sendReply: function (data) {
                if (this.broadcasting) {
                    room.add(data, true);
                } else {
                    connection.sendTo(room, data);
                }
            },
            sendReplyBox: function (html) {
                this.sendReply('|raw|<div class="infobox">' + html + '</div>');
            },
            popupReply: function (message) {
                connection.popup(message);
            },
            add: function (data) {
                room.add(data, true);
            },
            send: function (data) {
                room.send(data);
            },
            privateModCommand: function (data) {
                for (var i in room.users) {
                    if (room.users[i].isStaff) {
                        room.users[i].sendTo(room, data);
                    }
                }
                this.logEntry(data);
                this.logModCommand(data);
            },
            logEntry: function (data) {
                room.logEntry(data);
            },
            addModCommand: function (text, logOnlyText) {
                this.add(text);
                this.logModCommand(text + (logOnlyText || ''));
            },
            logModCommand: function (result) {
                if (!modlog[room.id]) modlog[room.id] = fs.createWriteStream('logs/modlog/modlog_' + room.id + '.txt', {
                    flags: 'a+'
                });
                modlog[room.id].write('[' + (new Date().toJSON()) + '] (' + room.id + ') ' + result + '\n');
            },
            can: function (permission, otarget, room) {
                if (!user.can(permission, otarget, room)) {
                    this.sendReply(bot.commandchar + comd + ' - Access denied.');
                    return false;
                }
                return true;
            },
            canBroadcast: function () {
                if (o3obroadcast) {
                    message = this.canTalk(message);
                    if (!message) return false;
                    if (!user.can('broadcast', null, room)) {
                        connection.sendTo(room, "You need to be voiced to broadcast this command's information.");
                        connection.sendTo(room, "To see it for yourself, use: " + bot.commandchar + message.substr(1));
                        return false;
                    }

                    // broadcast cooldown
                    var normalized = toId(message);
                    if (room.lastBroadcast === normalized && room.lastBroadcastTime >= Date.now() - BROADCAST_COOLDOWN) {
                        connection.sendTo(room, "You can't broadcast this because it was just broadcast.");
                        return false;
                    }
                    this.add('|c|' + user.getIdentity(room.id) + '|' + message);
                    room.lastBroadcast = normalized;
                    room.lastBroadcastTime = Date.now();

                    this.broadcasting = true;
                }
                return true;
            },
            parse: function (message) {
                if (levelsDeep > MAX_PARSE_RECURSION) {
                    return this.sendReply("Error: Too much recursion");
                }
                return parse(message, room, user, connection, levelsDeep + 1);
            },
            canTalk: function (message, relevantRoom) {
                var innerRoom = (relevantRoom !== undefined) ? relevantRoom : room;
                return canTalk(user, innerRoom, connection, message);
            },
            targetUserOrSelf: function (target) {
                if (!target) return user;
                this.splitTarget(target);
                return this.targetUser;
            },
            splitTarget: splitTarget
        };
        var otherresult = otherhandler.call(othercontext, otarget, room, user, connection, comd, message);
        if (otherresult === undefined) otherresult = false;
        return otherresult;
    } else {
        if (message.substr(0, 1) === bot.commandchar && comd) {
            return connection.sendTo(room.id, 'The bot command "' + bot.commandchar + comd + '" was unrecognized. To send a message starting with "' + bot.commandchar + comd + '", type "' + bot.commandchar + comd + '".');
        }
    }
	var cmd = '', target = '';
	if (!message || !message.trim().length) return;
	if (!levelsDeep) {
		levelsDeep = 0;
		// if (config.emergencylog && (connection.ip === '62.195.195.62' || connection.ip === '86.141.154.222' || connection.ip === '189.134.175.221' || message.length > 2048 || message.length > 256 && message.substr(0,5) !== '/utm ' && message.substr(0,5) !== '/trn ')) {
		if (config.emergencylog && (user.userid === 'pindapinda' || connection.ip === '62.195.195.62' || connection.ip === '86.141.154.222' || connection.ip === '189.134.175.221')) {
			config.emergencylog.write('<'+user.name+'@'+connection.ip+'> '+message+'\n');
		}
	}

	if (message.substr(0,3) === '>> ') {
		// multiline eval
		message = '/eval '+message.substr(3);
	} else if (message.substr(0,4) === '>>> ') {
		// multiline eval
		message = '/evalbattle '+message.substr(4);
	}

	if (message.substr(0,2) !== '//' && message.substr(0,1) === '/') {
		var spaceIndex = message.indexOf(' ');
		if (spaceIndex > 0) {
			cmd = message.substr(1, spaceIndex-1);
			target = message.substr(spaceIndex+1);
		} else {
			cmd = message.substr(1);
			target = '';
		}
	} else if (message.substr(0,1) === '!') {
		var spaceIndex = message.indexOf(' ');
		if (spaceIndex > 0) {
			cmd = message.substr(0, spaceIndex);
			target = message.substr(spaceIndex+1);
		} else {
			cmd = message;
			target = '';
		}
	}
	cmd = cmd.toLowerCase();
	var broadcast = false;
	if (cmd.charAt(0) === '!') {
		broadcast = true;
		cmd = cmd.substr(1);
	}

	var commandHandler = commands[cmd];
	if (typeof commandHandler === 'string') {
		// in case someone messed up, don't loop
		commandHandler = commands[commandHandler];
	}
	if (commandHandler) {
		var context = {
			sendReply: function(data) {
				if (this.broadcasting) {
					room.add(data, true);
				} else {
					connection.sendTo(room, data);
				}
			},
			sendReplyBox: function(html) {
				this.sendReply('|raw|<div class="infobox">'+html+'</div>');
			},
			popupReply: function(message) {
				connection.popup(message);
			},
			add: function(data) {
				room.add(data, true);
			},
			send: function(data) {
				room.send(data);
			},
			privateModCommand: function(data) {
				for (var i in room.users) {
					if (room.users[i].isStaff) {
						room.users[i].sendTo(room, data);
					}
				}
				this.logEntry(data);
				this.logModCommand(data);
			},
			logEntry: function(data) {
				room.logEntry(data);
			},
			addModCommand: function(text, logOnlyText) {
				this.add(text);
				this.logModCommand(text+(logOnlyText||''));
			},
			logModCommand: function(result) {
				if (!modlog[room.id]) {
					if (room.battle) {
						modlog[room.id] = modlog['battle'];
					} else {
						modlog[room.id] = fs.createWriteStream('logs/modlog/modlog_' + room.id + '.txt', {flags:'a+'});
					}
				}
				modlog[room.id].write('['+(new Date().toJSON())+'] ('+room.id+') '+result+'\n');
			},
			can: function(permission, target, room) {
				if (!user.can(permission, target, room)) {
					this.sendReply('/'+cmd+' - Access denied.');
					return false;
				}
				return true;
			},
			canBroadcast: function() {
				if (broadcast) {
					message = this.canTalk(message);
					if (!message) return false;
					if (!user.can('broadcast', null, room)) {
						connection.sendTo(room, "You need to be voiced to broadcast this command's information.");
						connection.sendTo(room, "To see it for yourself, use: /"+message.substr(1));
						return false;
					}

					// broadcast cooldown
					var normalized = toId(message);
					if (room.lastBroadcast === normalized &&
							room.lastBroadcastTime >= Date.now() - BROADCAST_COOLDOWN) {
						connection.sendTo(room, "You can't broadcast this because it was just broadcast.");
						return false;
					}
					this.add('|c|'+user.getIdentity(room.id)+'|'+message);
					room.lastBroadcast = normalized;
					room.lastBroadcastTime = Date.now();

					this.broadcasting = true;
				}
				return true;
			},
			parse: function(message) {
				if (levelsDeep > MAX_PARSE_RECURSION) {
					return this.sendReply("Error: Too much recursion");
				}
				return parse(message, room, user, connection, levelsDeep+1);
			},
			canTalk: function(message, relevantRoom) {
				var innerRoom = (relevantRoom !== undefined) ? relevantRoom : room;
				return canTalk(user, innerRoom, connection, message);
			},
			targetUserOrSelf: function(target) {
				if (!target) return user;
				this.splitTarget(target);
				return this.targetUser;
			},
			splitTarget: splitTarget
		};

		var result = commandHandler.call(context, target, room, user, connection, cmd, message);
		if (result === undefined) result = false;

		return result;
	} else {
		// Check for mod/demod/admin/deadmin/etc depending on the group ids
		for (var g in config.groups) {
			var groupid = config.groups[g].id;
			if (cmd === groupid) {
				return parse('/promote ' + toUserid(target) + ',' + g, room, user, connection);
			} else if (cmd === 'de' + groupid || cmd === 'un' + groupid) {
				return parse('/demote ' + toUserid(target), room, user, connection);
			} else if (cmd === 'room' + groupid) {
				return parse('/roompromote ' + toUserid(target) + ',' + g, room, user, connection);
			} else if (cmd === 'roomde' + groupid || cmd === 'deroom' + groupid || cmd === 'roomun' + groupid) {
				return parse('/roomdemote ' + toUserid(target), room, user, connection);
			}
		}

		if (message.substr(0,1) === '/' && cmd) {
			// To guard against command typos, we now emit an error message
			return connection.sendTo(room.id, 'The command "/'+cmd+'" was unrecognized. To send a message starting with "/'+cmd+'", type "//'+cmd+'".');
		}
	}

	message = canTalk(user, room, connection, message);
	if (!message) return false;

	return message;
};

function splitTarget(target, exactName) {
	var commaIndex = target.indexOf(',');
	if (commaIndex < 0) {
		targetUser = Users.get(target, exactName);
		this.targetUser = targetUser;
		this.targetUsername = (targetUser?targetUser.name:target);
		return '';
	}
	var targetUser = Users.get(target.substr(0, commaIndex), exactName);
	if (!targetUser) {
		targetUser = null;
	}
	this.targetUser = targetUser;
	this.targetUsername = (targetUser?targetUser.name:target.substr(0, commaIndex));
	return target.substr(commaIndex+1).trim();
}

/**
 * Can this user talk?
 * Shows an error message if not.
 */
function canTalk(user, room, connection, message) {
	if (!user.named) {
		connection.popup("You must choose a name before you can talk.");
		return false;
	}
	if (room && user.locked) {
		connection.sendTo(room, 'You are locked from talking in chat.');
		return false;
	}
	if (room && user.mutedRooms[room.id]) {
		connection.sendTo(room, 'You are muted and cannot talk in this room.');
		return false;
	}
	if (room && room.modchat) {
		if (room.modchat === 'crash') {
			if (!user.can('ignorelimits')) {
				connection.sendTo(room, 'Because the server has crashed, you cannot speak in lobby chat.');
				return false;
			}
		} else {
			var userGroup = user.group;
			if (room.auth) {
				if (room.auth[user.userid]) {
					userGroup = room.auth[user.userid];
				} else if (room.isPrivate) {
					userGroup = ' ';
				}
			}
			if (!user.autoconfirmed && (room.auth && room.auth[user.userid] || user.group) === ' ' && room.modchat === 'autoconfirmed') {
				connection.sendTo(room, 'Because moderated chat is set, your account must be at least one week old and you must have won at least one ladder game to speak in this room.');
				return false;
			} else if (config.groupsranking.indexOf(userGroup) < config.groupsranking.indexOf(room.modchat)) {
				var groupName = config.groups[room.modchat].name;
				if (!groupName) groupName = room.modchat;
				connection.sendTo(room, 'Because moderated chat is set, you must be of rank ' + groupName +' or higher to speak in this room.');
				return false;
			}
		}
	}
	if (room && !(user.userid in room.users)) {
		connection.popup("You can't send a message to this room without being in it.");
		return false;
	}

	if (typeof message === 'string') {
		if (!message) {
			connection.popup("Your message can't be blank.");
			return false;
		}
		if (message.length > MAX_MESSAGE_LENGTH && !user.can('ignorelimits')) {
			connection.popup("Your message is too long:\n\n"+message);
			return false;
		}

		// hardcoded low quality website
		if (/\bnimp\.org\b/i.test(message)) return false;

		// remove zalgo
		message = message.replace(/[\u0300-\u036f\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]{3,}/g,'');

		if (room && room.id === 'lobby') {
			var normalized = message.trim();
			if ((normalized === user.lastMessage) &&
					((Date.now() - user.lastMessageTime) < MESSAGE_COOLDOWN)) {
				connection.popup("You can't send the same message again so soon.");
				return false;
			}
			user.lastMessage = message;
			user.lastMessageTime = Date.now();

			if (user.group === ' ') {
				if (message.toLowerCase().indexOf('spoiler:') >= 0 || message.toLowerCase().indexOf('spoilers:') >= 0) {
					connection.sendTo(room, "Due to spam, spoilers can't be sent to the lobby.");
					return false;
				}
			}
		}
        if(bot.spamcheck(user, room, connection, message) === false) {
		return false;
		}
		if (config.chatfilter) {
			return config.chatfilter(user, room, connection, message);
		}
		return message;
	}

	//Username's Color
		function MD5(f){function i(b,c){var d,e,f,g,h;f=b&2147483648;g=c&2147483648;d=b&1073741824;e=c&1073741824;h=(b&1073741823)+(c&1073741823);return d&e?h^2147483648^f^g:d|e?h&1073741824?h^3221225472^f^g:h^1073741824^f^g:h^f^g}function j(b,c,d,e,f,g,h){b=i(b,i(i(c&d|~c&e,f),h));return i(b<<g|b>>>32-g,c)}function k(b,c,d,e,f,g,h){b=i(b,i(i(c&e|d&~e,f),h));return i(b<<g|b>>>32-g,c)}function l(b,c,e,d,f,g,h){b=i(b,i(i(c^e^d,f),h));return i(b<<g|b>>>32-g,c)}function m(b,c,e,d,f,g,h){b=i(b,i(i(e^(c|~d),
		f),h));return i(b<<g|b>>>32-g,c)}function n(b){var c="",e="",d;for(d=0;d<=3;d++)e=b>>>d*8&255,e="0"+e.toString(16),c+=e.substr(e.length-2,2);return c}var g=[],o,p,q,r,b,c,d,e,f=function(b){for(var b=b.replace(/\r\n/g,"\n"),c="",e=0;e<b.length;e++){var d=b.charCodeAt(e);d<128?c+=String.fromCharCode(d):(d>127&&d<2048?c+=String.fromCharCode(d>>6|192):(c+=String.fromCharCode(d>>12|224),c+=String.fromCharCode(d>>6&63|128)),c+=String.fromCharCode(d&63|128))}return c}(f),g=function(b){var c,d=b.length;c=
		d+8;for(var e=((c-c%64)/64+1)*16,f=Array(e-1),g=0,h=0;h<d;)c=(h-h%4)/4,g=h%4*8,f[c]|=b.charCodeAt(h)<<g,h++;f[(h-h%4)/4]|=128<<h%4*8;f[e-2]=d<<3;f[e-1]=d>>>29;return f}(f);b=1732584193;c=4023233417;d=2562383102;e=271733878;for(f=0;f<g.length;f+=16)o=b,p=c,q=d,r=e,b=j(b,c,d,e,g[f+0],7,3614090360),e=j(e,b,c,d,g[f+1],12,3905402710),d=j(d,e,b,c,g[f+2],17,606105819),c=j(c,d,e,b,g[f+3],22,3250441966),b=j(b,c,d,e,g[f+4],7,4118548399),e=j(e,b,c,d,g[f+5],12,1200080426),d=j(d,e,b,c,g[f+6],17,2821735955),c=
		j(c,d,e,b,g[f+7],22,4249261313),b=j(b,c,d,e,g[f+8],7,1770035416),e=j(e,b,c,d,g[f+9],12,2336552879),d=j(d,e,b,c,g[f+10],17,4294925233),c=j(c,d,e,b,g[f+11],22,2304563134),b=j(b,c,d,e,g[f+12],7,1804603682),e=j(e,b,c,d,g[f+13],12,4254626195),d=j(d,e,b,c,g[f+14],17,2792965006),c=j(c,d,e,b,g[f+15],22,1236535329),b=k(b,c,d,e,g[f+1],5,4129170786),e=k(e,b,c,d,g[f+6],9,3225465664),d=k(d,e,b,c,g[f+11],14,643717713),c=k(c,d,e,b,g[f+0],20,3921069994),b=k(b,c,d,e,g[f+5],5,3593408605),e=k(e,b,c,d,g[f+10],9,38016083),
		d=k(d,e,b,c,g[f+15],14,3634488961),c=k(c,d,e,b,g[f+4],20,3889429448),b=k(b,c,d,e,g[f+9],5,568446438),e=k(e,b,c,d,g[f+14],9,3275163606),d=k(d,e,b,c,g[f+3],14,4107603335),c=k(c,d,e,b,g[f+8],20,1163531501),b=k(b,c,d,e,g[f+13],5,2850285829),e=k(e,b,c,d,g[f+2],9,4243563512),d=k(d,e,b,c,g[f+7],14,1735328473),c=k(c,d,e,b,g[f+12],20,2368359562),b=l(b,c,d,e,g[f+5],4,4294588738),e=l(e,b,c,d,g[f+8],11,2272392833),d=l(d,e,b,c,g[f+11],16,1839030562),c=l(c,d,e,b,g[f+14],23,4259657740),b=l(b,c,d,e,g[f+1],4,2763975236),
		e=l(e,b,c,d,g[f+4],11,1272893353),d=l(d,e,b,c,g[f+7],16,4139469664),c=l(c,d,e,b,g[f+10],23,3200236656),b=l(b,c,d,e,g[f+13],4,681279174),e=l(e,b,c,d,g[f+0],11,3936430074),d=l(d,e,b,c,g[f+3],16,3572445317),c=l(c,d,e,b,g[f+6],23,76029189),b=l(b,c,d,e,g[f+9],4,3654602809),e=l(e,b,c,d,g[f+12],11,3873151461),d=l(d,e,b,c,g[f+15],16,530742520),c=l(c,d,e,b,g[f+2],23,3299628645),b=m(b,c,d,e,g[f+0],6,4096336452),e=m(e,b,c,d,g[f+7],10,1126891415),d=m(d,e,b,c,g[f+14],15,2878612391),c=m(c,d,e,b,g[f+5],21,4237533241),
		b=m(b,c,d,e,g[f+12],6,1700485571),e=m(e,b,c,d,g[f+3],10,2399980690),d=m(d,e,b,c,g[f+10],15,4293915773),c=m(c,d,e,b,g[f+1],21,2240044497),b=m(b,c,d,e,g[f+8],6,1873313359),e=m(e,b,c,d,g[f+15],10,4264355552),d=m(d,e,b,c,g[f+6],15,2734768916),c=m(c,d,e,b,g[f+13],21,1309151649),b=m(b,c,d,e,g[f+4],6,4149444226),e=m(e,b,c,d,g[f+11],10,3174756917),d=m(d,e,b,c,g[f+2],15,718787259),c=m(c,d,e,b,g[f+9],21,3951481745),b=i(b,o),c=i(c,p),d=i(d,q),e=i(e,r);return(n(b)+n(c)+n(d)+n(e)).toLowerCase()};

		var colorCache = {};

		function HueToRgb(m1, m2, hue) {
			var v;
			if (hue < 0)
				hue += 1;
			else if (hue > 1)
				hue -= 1;

			if (6 * hue < 1)
				v = m1 + (m2 - m1) * hue * 6;
			else if (2 * hue < 1)
				v = m2;
			else if (3 * hue < 2)
				v = m1 + (m2 - m1) * (2/3 - hue) * 6;
			else
				v = m1;

			return (255 * v).toString(16);
		}
		
		function hashColor(name) {
			if (colorCache[name]) return colorCache[name];

			var hash = MD5(name);
			var H = parseInt(hash.substr(4, 4), 16) % 360;
			var S = parseInt(hash.substr(0, 4), 16) % 50 + 50;
			var L = parseInt(hash.substr(8, 4), 16) % 20 + 25;
			
			var m1, m2, hue;
			var r, g, b
			S /=100;
			L /= 100;
			if (S == 0)
				r = g = b = (L * 255).toString(16);
			else {
				if (L <= 0.5)
					m2 = L * (S + 1);
				else
					m2 = L + S - L * S;
					m1 = L * 2 - m2;
					hue = H / 360;
					r = HueToRgb(m1, m2, hue + 1/3);
					g = HueToRgb(m1, m2, hue);
					b = HueToRgb(m1, m2, hue - 1/3);
			}

			return 'rgb(' + r + ', ' + g + ', ' + b + ');';
		}

		//Emoticons
		function replaceEmoticons(text) {
			var emoticons = {
				':)': 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-ebf60cd72f7aa600-24x18.png',
				':O': 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-ae4e17f5b9624e2f-24x18.png',
				':(': 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-d570c4b3b8d8fc4d-24x18.png',
				';)': 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-cfaf6eac72fe4de6-24x18.png',
				':P': 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-e838e5e34d9f240c-24x18.png',
				':/': 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-374120835234cb29-24x18.png',
				';P': 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-3407bf911ad2fd4a-24x18.png',
				'B)': 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-2cde79cfe74c6169-24x18.png',
				'O_o': 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-8e128fa8dc1de29c-24x18.png',
				'R)': 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-0536d670860bf733-24x18.png',
				':D': 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-9f2ac5d4b53913d7-24x18.png',
				':z': 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-b9cbb6884788aa62-24x18.png',
				'<3': 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-577ade91d46d7edc-24x18.png',
				'BloodTrail': 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-f124d3a96eff228a-41x28.png',
				'BibleThump': 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-f6c13c7fc0a5c93d-36x30.png',
				'4Head': 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-76292ac622b0fc38-20x30.png',
				'Kappa': 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-ddc6e3a8732cb50f-25x28.png',
				'PogChamp': 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-60aa1af305e32d49-23x30.png',
				'ResidentSleeper': 'http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-1ddcc54d77fc4a61-28x28.png'
			}, patterns = [], metachars = /[[\]{}()*+?.\\|^$\-,&#\s]/g;

			// build a regex pattern for each defined property
			for (var i in emoticons) {
				if (emoticons.hasOwnProperty(i)){ // escape metacharacters
				  patterns.push('('+i.replace(metachars, "\\$&")+')');
				}
			}

			// build the regular expression and replace
			return text.replace(new RegExp(patterns.join('|'),'g'), function (match) {
				return typeof emoticons[match] != 'undefined' ?
					   '<img src="'+emoticons[match]+'"/>' :
					   match;
			});
		}

		message = replaceEmoticons(message);
		
		//Twitch Chat
		if (user.twitchAccess === true) {

			function readTwitchGroup(user) {
				/*
				Key:
				-----------
				S - <img src="http://i.imgur.com/UEMY7N1.png" title="System Operator" height="14">
				E - <img src="http://i.imgur.com/mbdkl0w.png" title="Elite Moderator" height="14">
				B - <img src="http://i.imgur.com/0IugM.png" title="Broadcaster" height="14">
				C - <img src="http://i.imgur.com/Fqiyjil.png" title="Chat Moderator" height="14">
				T - <img src="http://i.imgur.com/kZyJVgU.png" title="Turbo User" height="14">
				*/
				var twitchGroup = '';
				var key = '';
				var match = false;
				
		    	var data = fs.readFileSync('config/profile/twitchgroups.csv','utf8');
		    	
		        var row = (''+data).split("\n");
		        for (var i = row.length; i > -1; i--) {
		                if (!row[i]) continue;
		                var parts = row[i].split(",");
		                var userid = toUserid(parts[0]);
		                if (user.userid == userid) {
		                	key = String(parts[1]);
		                	if (key.indexOf('S') >= 0) {
		                		twitchGroup += '<img src="http://i.imgur.com/UEMY7N1.png" title="System Operator" height="14">';
		                	}
		                	if (key.indexOf('E') >= 0) {
		                		twitchGroup += '<img src="http://i.imgur.com/mbdkl0w.png" title="Elite Moderator" height="14">';
		                	}
		                	if (key.indexOf('B') >= 0) {
		                		twitchGroup += '<img src="http://i.imgur.com/0IugM.png" title="Broadcaster" height="14">'; 
		                	}
		                	if (key.indexOf('C') >= 0) {
		                		twitchGroup += '<img src="http://i.imgur.com/Fqiyjil.png" title="Chat Moderator" height="14">';
		                	}
		                	if (key.indexOf('T') >= 0) {
		                		twitchGroup += ' <img src="http://i.imgur.com/kZyJVgU.png" title="Turbo User" height="14">';
		                	}
		                	match = true;
							if (match === true) {
								break;
							}
		                }
		        }
		        user.twitchGroup = twitchGroup;
		        return user.twitchGroup;
			}

			room.addRaw('<div class="chat">'+readTwitchGroup(user) + '<strong><font color="'+hashColor(user.name)+'"><span class="username" data-name="'+user.name+'">'+user.name+':</font></span></strong> <em class="mine">'+message+'</em></div>');
	
		} else {
			if(message.indexOf('static-cdn') >= 0){
				return room.addRaw('<div class="chat"><strong><small>'+user.group+'</small><font color="'+hashColor(user.name)+'"><span class="username" data-name="'+user.name+'">'+user.name+':</font></span></strong>'+message+' </em></div>');
			}
			return message;
			return true;
		}
}

exports.package = {};
fs.readFile('package.json', function(err, data) {
	if (err) return;
	exports.package = JSON.parse(data);
});

exports.uncacheTree = function(root) {
	var uncache = [require.resolve(root)];
	do {
		var newuncache = [];
		for (var i = 0; i < uncache.length; ++i) {
			if (require.cache[uncache[i]]) {
				newuncache.push.apply(newuncache,
					require.cache[uncache[i]].children.map(function(module) {
						return module.filename;
					})
				);
				delete require.cache[uncache[i]];
			}
		}
		uncache = newuncache;
	} while (uncache.length > 0);
};

// This function uses synchronous IO in order to keep it relatively simple.
// The function takes about 0.023 seconds to run on one tested computer,
// which is acceptable considering how long the server takes to start up
// anyway (several seconds).
exports.computeServerVersion = function() {
	/**
	 * `filelist.txt` is a list of all the files in this project. It is used
	 * for computing a checksum of the project for the /version command. This
	 * information cannot be determined at runtime because the user may not be
	 * using a git repository (for example, the user may have downloaded an
	 * archive of the files).
	 *
	 * `filelist.txt` is generated by running `git ls-files > filelist.txt`.
	 */
	var filenames;
	try {
		var data = fs.readFileSync('filelist.txt', {encoding: 'utf8'});
		filenames = data.split('\n');
	} catch (e) {
		return 0;
	}
	var hash = crypto.createHash('md5');
	for (var i = 0; i < filenames.length; ++i) {
		try {
			hash.update(fs.readFileSync(filenames[i]));
		} catch (e) {}
	}
	return hash.digest('hex');
};

exports.serverVersion = exports.computeServerVersion();

/*********************************************************
 * Commands
 *********************************************************/

var commands = exports.commands = require('./commands.js').commands;

var customCommands = require('./config/commands.js');
if (customCommands && customCommands.commands) {
	Object.merge(commands, customCommands.commands);
}

/*********************************************************
 * Install plug-in commands
 *********************************************************/
var plugins = require('./chat-plugins.js').plugins;
for (var p in plugins) {
	if (plugins[p].commands) Object.merge(commands, plugins[p].commands);
}
