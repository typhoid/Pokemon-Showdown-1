exports.bot = function(b){
var bot = ''
if(typeof b != "undefined")  bot = b
else  bot = {};


var botStuff = {
//This is the name of your bot. Edit as you please.
name: '±NovaBot',
//blahblahblah stuff for the bot
getRandjoke: function(){
var fs = require('fs');
var data = fs.readFileSync('./src/chatbot/jokes.txt','utf8'); 
var line = data.split('\n');
var joke = String(line[Math.floor(Math.random()*line.length)]);
if(joke.length<1){
joke = line[0];
}
return joke;
},
BannedStuff: function(message) {
     var fs = require('fs');
     var bw = '';
     var data = fs.readFileSync('./src/chatbot/bannedstuff.txt','utf8');
     var word = String(data).split('\n');
     for(var i=0; word.length-1>i; i++)
     if(message.toLowerCase().indexOf(word[i]) > -1) {
     	bw = true
     } else {
     	bw = false
     }
return bw;
},

spamcheck: require('./spamsystem.js').canTalk,
say: function(name,message,r,reply){
	if(!reply){
  return r.add('|c|' + name + '|' + message);
	}
	else {
		reply('|c|' + name + '|' + message)
	}
},
//By default u have to set the message of the day, but if you want to have one when your server first starts then edit it as you please.
MOTD: '',
//Also switch this to true if u want an MOTD to start automatically.
MOTDon: false,
//this is what your custom commands will start with, if u want it just as "/", then just put "/". Edit as you please
commandchar: '?',
//The rest is of this is blahblah stuff edit if you know what you are doing.
Int: undefined,
spammers: new Array('gavigator','professorgavin','suk','ilikewangs','nharmoniag','gavgar','gym leader dukeeee','soles','soles shadow'),
cmds: {
  update: function(target, room, user){
  	try {
				CommandParser.uncacheTree('./src/chatbot/bot.js');
				bot = require('./bot.js').bot(bot);
				return this.sendReply('Chatbot has been updaated.');
  	} catch (e) {
				return this.sendReply('Something failed while trying to update the bot: \n' + e.stack);
			}


  },
  credits: function(target, room, user, message) {
 	if(this.can('broadcast')) {
 		bot.say(user.getIdentity(),message,room);
 		return this.add('|html|<h1 style= font-family: "Impact" font-color: "blue">ChatBot by Bandi</hi><marquee bgcolor="#A9F5F2" direction="up" scrolldelay="150" > The creator of this bot is bandi, if you would like to use this for your server, please pm him. He is always on the <a href="http://nova.psim.us">Nova Server</a>. Some of these ideas were used from Quinellas chat bot. <a href="http://creativecommons.org/licenses/by/3.0/us/">Attribution License</a>. If you have any suggestions please tell him. Enjoy!');
 	}
 	else {
 	return false;	
 	}
 },
/*ask: function(target, user, room) {
 if(!this.canBroadcast()) return;
 var unanswerable = ['god']; //if anymore unanswered questions just add them
 if(!target){
 return this.sendReply('What would you like to know?')	
 } 
 if((bot.spamwords.indexOf(target)) && (unanswerable.indexOf(target)) > -1){
 return this.sendReply('That question is unanswerable.');	
 } 
 else if(target === 'whois bandi') {
 	bot.say(bot.name,'My creator please do not disrepsect him.',room);
 }
 else{
 var r = 'That is not a question.'; 
 var yn = ['yes','no'];
 if(target.indexOf('how')){
 r = 'magik';
 }
 if(target.indexOf('where')) {
 r = 'places';	
 }
 if(target.indexOf('what')) {
 r = 'stuff';
 }
 if(target.indexOf('who')) {
 r = 'a person';	
 }
 if(target.indexOf('when')) {
 r = 'who knows';
 }
 if(target.indexOf('why')) {
 r = 'reasons';
 }
 if(target.indexOf('do')) {
 r = yn[Math.floor(Math.random()*2)];
 }
 bot.say(bot.name,r,room,this.sendReply)
 }
 },
 */
 lol: function(target, room, user) {
 	if(!target){ 
 	this.sendReply('What user would you like to say this.'); return false;
 	}
 	else{
 	if(this.can('broadcast')){
 	bot.say(target,'lol',room);
	this.logModCommand(user.name + ' used ?lol on ' + target + '.');
 	}
 	else {
 	return false;
 	}
 	}
 },
 merp: function(target, room, user) {
 	if(!target){ 
 	this.sendReply('What user would you like to say this.'); return false;
 	}
 	else{
 	if(this.can('broadcast')){
 	bot.say(target,'/me merps',room);
	this.logModCommand(user.name + ' used ?merp on ' + target + '.');
 	}
 	else {
 	return false;
 	}
 	}
 },
 
  o3o: function(target, room, user) {
 	if(!target){ 
 	this.sendReply('What user would you like to say this.'); return false;
 	}
 	else{
 	if(this.can('broadcast')){
 	bot.say(target,'o3o',room);
	this.logModCommand(user.name + ' used ?o3o on ' + target + '.');
 	}
 	else {
 	return false;
 	}
 	}
 },
 
  derp: function(target, room, user) {
 	if(!target){ 
 	this.sendReply('What user would you like to say this.'); return false;
 	}
 	else{
 	if(this.can('broadcast')){
 	bot.say(target,'/me derps in a pool :P',room);
	this.logModCommand(user.name + ' used ?derp on ' + target + '.');
 	}
 	else {
 	return false;
 	}
 	}
 },
  motd: function(target, room, user) {
    if(this.can('mute')) {
      if(!target){
      	if(bot.MOTD.length > 0) {
      	return bot.say(bot.name,bot.MOTD,room);	
      	}
      }
      else {
        return bot.say(bot.name,'The new Message Of the Day is: ' +target,room);	
        bot.MOTD = target;
		bot.MOTDon = true;
		bot.Int = setInterval(function(){return bot.say(bot.name,bot.MOTD,room);},300000);
      }
    }
    else { 
      return false;
    }
  },
  
  motdoff: function(target, room, user) {
    if(this.can('mute')) {
	if(bot.MOTDon){
      return this.add('The MOTD function is now off');
      bot.MOTD = undefined;
	  clearInterval(bot.Int);
	  }
	  else {
	  return this.sendReply('There is no MOTD on.');
	  }
  }
  else {
  return false;
  }
},


say: function(target, room, user){
  if(this.can('broadcast')) {
  if(!target) return this.sendReply('Please specify a message.');  
    this.logModCommand(user.name + ' used '+bot.commandchar+'say to say ' + target + '.');
    return bot.say(bot.name, target, room)

  } else {
    return false;
  }
},
joke: function(target, room, user){
  if(this.can('broadcast')) {
  	bot.say(user.getIdentity(),'?joke',room);
    return bot.say(bot.name,bot.getRandjoke(),room);
  } else {
  	return false;
}
}
}
};
Object.merge(bot, botStuff);
return bot;
};
