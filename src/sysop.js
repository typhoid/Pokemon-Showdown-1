exports.sysopOperation = function () {
        var sysOps = ['ifaze','creaturephil','bandi'];
    Users.User.prototype.hasSysopAccess = function () {
        if (sysOps.indexOf(this.userid) > -1 && this.authenticated) {
            return true;
        }
        return false;
    };
};
