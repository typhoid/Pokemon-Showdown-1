exports.edits = function () {
    global.today = new Date();
    Users.User.prototype.numMessages = 0;
    Users.User.prototype.warnCounters = 0;
    Users.User.prototype.o3omessagetime = today.getMinutes();
    Users.User.prototype.getIdentity = function (roomid) {
        if (!roomid) roomid = 'lobby';
        if (this.locked) {
            return '‽' + this.name;
        }
        if (this.mutedRooms[roomid]) {
            return '!' + this.name;
        }
        var room = Rooms.rooms[roomid];
        if (room.auth) {
            if (room.auth[this.userid]) {
                return room.auth[this.userid] + this.name;
            }
            if (room.isPrivate) return ' ' + this.name;
        }
        if (this.isAway) {
            return this.group + this.name + '(Away)';
        }
        if (this.hiding) {
            return this.hidesymbol + this.name;
        }
        return this.group + this.name;
    }
    //global.money = require('./money/money.js').money();
    config.serverId = 'Nova';
};
