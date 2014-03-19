exports.cmds = {
searchdice: function(target, room, user){
  if(!target || isNaN(target)){
    return this.sendReply('Please enter a real amount to search dice for.')
  }
if(user.searchingdice === true) {
this.sendReply('You are already searching for a game of dice.');
} else {
this.sendReply('You are now searching for a game of dice');
user.dicesearch = true;
}
user,dicebet = parseInt(target);
user.dice = Math.floor(Math.random*6);
for(var i in Users.users){ 
if(Users.users[i].dicesearch){
Users.users[i].dice = Math.floor(Math.random*6);
break;
}
if(user.dice > Users.users[i]){
  user.popup('You won the game of dice and won ' + user.dicebet);
  Users.users[i].popup('You lost the the game of dice and lost ' + user.dicebet);
}
}
}
};
