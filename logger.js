
var   config = require('./config')
    , engine = require('tingodb')()
    , db = new engine.Db('./db/' , {})    
    , logs = db.collection('logs')
    , Q = require('q');

var logger = {
    _levels : {
        'info' : 1,
        'debug' : 2,
        'warn' : 3,
        'error' : 4,
        'fatal' : 5
    },
    _log : function (source, msg, level, err) {
        // make sure we have common indexes sorted
        logs.ensureIndex({ level : 1 });
        logs.ensureIndex({ source : 1 });
        logs.ensureIndex({ at : -1 });
        
        var currentLevel = logger._levels[config.logging.level],
            providedLevel = logger._levels[level] || 4; // if the levels is invalid default to 'error'
        
	if (providedLevel >= currentLevel) {
            var entry = { source : source, 
                          level : level, 
                          err : JSON.stringify(err), 
                          msg : msg, 
                          at : new Date() };
            logs.insert(entry);
//		console.log(entry);
        }
    },
    error : function (source, msg, err) {
        logger._log(source, msg, 'error', err);
    },
    debug : function (source, msg) {
        logger._log(source, msg, 'debug', null);
    },
    warn : function (source, msg) {
        logger._log(source, msg, 'warn', null);
    },
    info : function (source, msg) {
        logger._log(source, msg, 'info', null);
    },
    fatal : function (source, msg, err) {
        logger._log(source, msg, 'fatal', err);
    },
    query : function (filter) {
        return Q.ninvoke(logs, "find", filter, { sort : [["at", "desc"]] })
            .then(function (cursor) { 
                return Q.ninvoke(cursor, "toArray"); 
            });
    }
}

// expose public methods
module.exports.error = logger.error;
module.exports.debug = logger.debug;
module.exports.warn = logger.warn;
module.exports.info = logger.info;
module.exports.fatal = logger.fatal;
module.exports.query = logger.query;
