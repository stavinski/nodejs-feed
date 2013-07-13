
var   config = require('./config')
    , engine = require('tingodb')()
    , db = new engine.Db('./db/' , {})    
    , logs = db.collection('logs')

var logger = {
    _levels : {
        'info' : 1,
        'debug' : 2,
        'warn' : 3,
        'error' : 4,
        'fatal' : 5
    },
    _log : function (source, msg, level, err) {
        console.log('asked to log');
        
        var currentLevel = logger._levels[config.logging.level],
            providedLevel = logger._levels[level] || 4; // if the levels is invalid default to 'error'
        
        if (providedLevel >= currentLevel) {
            var entry = { source : 'subscriptiondownload', 
                          level : 'error', 
                          err : err, 
                          msg : msg, 
                          at : new Date() };
            logs.insert(entry);
        }
    },
    error : function (source, msg, err) {
        logger._log(source, msg, 'error', err);
    },
    debug : function (source, msg) {
        logger._log(source, msg, 'debug');
    },
    warn : function (source, msg) {
        logger._log(source, msg, 'warn');
    },
    info : function (source, msg) {
        logger._log(source, msg, 'info');
    },
    fatal : function (source, msg, err) {
        logger._log(source, msg, 'fatal', err);
    }
}

// expose public methods
module.exports.error = logger.error;
module.exports.debug = logger.debug;
module.exports.warn = logger.warn;
module.exports.info = logger.info;
module.exports.fatal = logger.fatal;