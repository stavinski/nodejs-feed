var config = require('./config')
    , engine = require('tingodb')()
    , db = new engine.Db( config.db.path , {})
    , subscriptions = db.collection('subscriptions');

var execute = function () {
    
    var createIndexes = function() {
        subscriptions.ensureIndex({ profile: 1 });
    };

    createIndexes();
};

module.exports.execute = execute;
 
    