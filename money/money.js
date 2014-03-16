/*********************************************************
 * Money Functions                                        *
 *********************************************************/
exports.money = function (m) {
    if (typeof m != "undefined") var money = m;
    else var money = new Object();
    var usermoney = {};
    var usertkts = {};
    var userwealth = usermoney;

    var Moneystuff = {
        importtkts: function (uid) {
            var data = fs.readFileSync('./config/usertkts.csv', 'utf8');
            var match = false;
            var tkts = 0;
            var row = ('' + data).split("\n");
            var line = '';
            for (var i = row.length; i > -1; i--) {
                if (!row[i]) continue;
                var parts = row[i].split(",");
                var userid = toUserid(parts[0]);
                if (uid.userid == userid) {
                    var x = Number(parts[1]);
                    var tkts = x;
                    match = true;
                    uid.tkts = tkts;
                    if (match === true) {
                        line = line + row[i];
                        break;
                    }
                }
            }
            return true;
        },
        importmoney: function (uid) {
            var data = fs.readFileSync('./config/userwealth.csv', 'utf8');
            var match = false;
            var money = 0;
            var row = ('' + data).split("\n");
            var line = '';
            for (var i = row.length; i > -1; i--) {
                if (!row[i]) continue;
                var parts = row[i].split(",");
                var userid = toUserid(parts[0]);
                if (uid.userid == userid) {
                    var x = Number(parts[1]);
                    var money = x;
                    match = true;
                    uid.dollars = money;
                    if (match === true) {
                        line = line + row[i];
                        break;
                    }
                }
            }
            return true;
        },
        exportmoney: function (uid) {
            var data = fs.readFileSync('./config/userwealth.csv', 'utf8')
            var row = ('' + data).split("\n");
            var match = false;
            var line = '';
            for (var i = row.length; i > -1; i--) {
                if (!row[i]) continue;
                var parts = row[i].split(",");
                var userid = toUserid(parts[0]);
                if (uid.userid == userid) {
                    var x = Number(parts[1]);
                    var money = x;
                    match = true;
                    if (match === true) {
                        line = line + row[i];
                        break;
                    }
                }
            }
            if (match === true) {
                var re = new RegExp(line, "g");
                fs.readFile('./config/userwealth.csv', 'utf8', function (err, data) {
                    if (err) {
                        return console.log(err);
                    }
                    var result = data.replace(re, uid.userid + ',' + uid.dollars);
                    fs.writeFile('./config/userwealth.csv', result, 'utf8', function (err) {
                        if (err) return console.log(err);
                    });
                });
            } else {
                var log = fs.createWriteStream('./config/userwealth.csv', {
                    'flags': 'a'
                });
                log.write("\n" + uid.userid + ',' + uid.dollars);
                money.importmoney(uid)
            }
        },
        importbp: function (uid) {
            var data = fs.readFileSync('./config/userbp.csv', 'utf8');
            var match = false;
            var money = 0;
            var row = ('' + data).split("\n");
            var line = '';
            for (var i = row.length; i > -1; i--) {
                if (!row[i]) continue;
                var parts = row[i].split(",");
                var userid = toUserid(parts[0]);
                if (uid.userid == userid) {
                    var x = Number(parts[1]);
                    var money = x;
                    match = true;
                    uid.bp = money;
                    if (match === true) {
                        line = line + row[i];
                        break;
                    }
                }
            }
            return true;
        },
        exportbp: function (uid) {
            var data = fs.readFileSync('./config/userbp.csv', 'utf8')
            var row = ('' + data).split("\n");
            var match = false;
            var line = '';
            for (var i = row.length; i > -1; i--) {
                if (!row[i]) continue;
                var parts = row[i].split(",");
                var userid = toUserid(parts[0]);
                if (uid.userid == userid) {
                    var x = Number(parts[1]);
                    var money = x;
                    match = true;
                    if (match === true) {
                        line = line + row[i];
                        break;
                    }
                }
            }
            if (match === true) {
                var re = new RegExp(line, "g");
                fs.readFile('./config/userbp.csv', 'utf8', function (err, data) {
                    if (err) {
                        return console.log(err);
                    }
                    var result = data.replace(re, uid.userid + ',' + uid.bp);
                    fs.writeFile('./config/userbp.csv', result, 'utf8', function (err) {
                        if (err) return console.log(err);
                    });
                });
            } else {
                var log = fs.createWriteStream('./config/userbp.csv', {
                    'flags': 'a'
                });
                log.write("\n" + uid.userid + ',' + uid.bp);
                money.importbp(uid)
            }
        },
        importcoins: function (uid) {
            var data = fs.readFileSync('./config/usercoins.csv', 'utf8');
            var match = false;
            var money = 0;
            var row = ('' + data).split("\n");
            var line = '';
            for (var i = row.length; i > -1; i--) {
                if (!row[i]) continue;
                var parts = row[i].split(",");
                var userid = toUserid(parts[0]);
                if (uid.userid == userid) {
                    var x = Number(parts[1]);
                    var money = x;
                    match = true;
                    uid.coins = money;
                    if (match === true) {
                        line = line + row[i];
                        break;
                    }
                }
            }
            return true;
        },
        exportcoins: function (uid) {
            var data = fs.readFileSync('./config/usercoins.csv', 'utf8')
            var row = ('' + data).split("\n");
            var match = false;
            var line = '';
            for (var i = row.length; i > -1; i--) {
                if (!row[i]) continue;
                var parts = row[i].split(",");
                var userid = toUserid(parts[0]);
                if (uid.userid == userid) {
                    var x = Number(parts[1]);
                    var money = x;
                    match = true;
                    if (match === true) {
                        line = line + row[i];
                        break;
                    }
                }
            }
            if (match === true) {
                var re = new RegExp(line, "g");
                fs.readFile('./config/usercoins.csv', 'utf8', function (err, data) {
                    if (err) {
                        return console.log(err);
                    }
                    var result = data.replace(re, uid.userid + ',' + uid.coins);
                    fs.writeFile('./config/usercoins.csv', result, 'utf8', function (err) {
                        if (err) return console.log(err);
                    });
                });
            } else {
                var log = fs.createWriteStream('./config/usercoins.csv', {
                    'flags': 'a'
                });
                log.write("\n" + uid.userid + ',' + uid.coins);
                money.importcoins(uid)
            }
        },
        exporttkts: function (uid) {
            var data = fs.readFileSync('./config/usertkts.csv', 'utf8')
            var row = ('' + data).split("\n");
            var match = false;
            var line = '';
            for (var i = row.length; i > -1; i--) {
                if (!row[i]) continue;
                var parts = row[i].split(",");
                var userid = toUserid(parts[0]);
                if (uid.userid == userid) {
                    var x = Number(parts[1]);
                    var money = x;
                    match = true;
                    if (match === true) {
                        line = line + row[i];
                        break;
                    }
                }
            }
            if (match === true) {
                var re = new RegExp(line, "g");
                fs.readFile('./config/usertkts.csv', 'utf8', function (err, data) {
                    if (err) {
                        return console.log(err);
                    }
                    var result = data.replace(re, uid.userid + ',' + uid.tkts);
                    fs.writeFile('./config/usertkts.csv', result, 'utf8', function (err) {
                        if (err) return console.log(err);
                    });
                });
            } else {
                var log = fs.createWriteStream('./config/usertkts.csv', {
                    'flags': 'a'
                });
                log.write("\n" + uid.userid + ',' + uid.tkts);
                money.importtkts(uid)
            }
        },
        started: money.settings.isOn,
        //start item functions 
        shop: require('./shop.js').shop,
        settings: require('./settings.js'),
        checkItem: function (target) {
            if (money.shop[target] !== undefined) return true
            else {
                return false;
            }
        },
        isBuyable: function (target) {
            var item = money.shop[target];
            if (user[item.currency] > item.price) {
                return true;
            }
            return false;
        },
        //end item functions
        transfer: function (type, amount) {
            if (type === 'coins') {
                if (user.bp >= amount) {
                    user.coins += amount;
                    user.bp -= amount;
                    return true
                } else {
                    return false
                }
            }
            if (type === 'dollars') {
                if (user.bp >= amount) {
                    user.dollars += amount * 100;
                    user.bp -= amount;
                    return true
                } else {
                    return false
                }
            }
        },
        alltkts: usertkts,
        allmoney: usermoney,
        read: function (user) {
            money.importmoney(user);
            money.importtkts(user);
			money.importcoins(user);
			money.importbp(user);
        },

        cmds: require('./cmds.js').cmds,
        save: function (user) {
            money.exportmoney(user);
            money.exporttkts(user);
			money.importcoins(user);
			money.importbp(user);
        }
    };
    Object.merge(CommandParser.commands, Moneystuff.cmds);
    Object.merge(money, Moneystuff);
    return money;
};
Users.User.prototype.dollars = 0;
Users.User.prototype.tkts = 0;
Users.User.prototype.coins = 0;
Users.User.prototype.bp = 0;
