exports.cmds = {
searchdice: function(target, room, user){
if(user.searchingdice === true) {
this.sendReply('You are already searching for a game of dice.');
} else {
this.sendReply('You are now searching for a game of dice');
user.dicesearch = true;
}
for(var i in Users.users){ 
if(Users.users[i].dicesearch){
Users.users[i].dice = Math.floor(Math.random*6);

}
}
}
};
