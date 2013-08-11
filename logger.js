
var   config = require('./config')
    , mongodb = require('mongodb')
    , dbServer = new mongodb.Server(config.db.host, config.db.port)
    , db = new mongodb.Db('ops', dbServer, {w:0})    
    , Q = require('q');

var logger = {
    _levels : {
        'debug' : 1,
        'info' : 2,
        'warn' : 3,
        'error' : 4,
        'fatal' : 5
    },
    _log : function (source, msg, level, err) {
        // NOT WORKING AS EXPECTED NEED TO INVESTIGATE!
    
        // return Q.ninvoke(db, 'open')
            // .then(function () {
                // var logs = db.collection('logs');
                
                // // make sure we have common indexes sorted
                // logs.ensureIndex({ level : 1 });
                // logs.ensureIndex({ source : 1 });
                // logs.ensureIndex({ at : -1 });
                
                // var currentLevel = logger._levels[config.logging.level],
                    // providedLevel = logger._levels[level] || 4; // if the levels is invalid default to 'error'
                
                // if (providedLevel >= currentLevel) {
                    // var entry = { source : source, 
                                  // level : level, 
                                  // err : JSON.stringify(err), 
                                  // msg : msg, 
                                  // at : new Date() };
                    // logs.insert(entry);
                // }
            // })
            // .fin(function () { db.close(); });
    },
    error : function (source, msg, err) {
        //return logger._log(source, msg, 'error', err);
    },
    debug : function (source, msg) {
        //return logger._log(source, msg, 'debug', null);
    },
    warn : function (source, msg) {
        //return logger._log(source, msg, 'warn', null);
    },
    info : function (source, msg) {
        //return logger._log(source, msg, 'info', null);
    },
    fatal : function (source, msg, err) {
        //return logger._log(source, msg, 'fatal', err);
    },
    query : function (filter) {
        // return Q.ninvoke(logs, "find", filter, { sort : [["at", "desc"]] })
            // .then(function (cursor) { 
                // return Q.ninvoke(cursor, "toArray"); 
            // });
    }
}

// expose public methods
module.exports.error = logger.error;
module.exports.debug = logger.debug;
module.exports.warn = logger.warn;
module.exports.info = logger.info;
module.exports.fatal = logger.fatal;
module.exports.query = logger.query;
