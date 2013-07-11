var config = require('../config')
    , engine = require('tingodb')()
    , db = new engine.Db( config.db.path , {})
    , subscriptions = db.collection('subscriptions')
    , articles = db.collection('articles');

var ensureIndexes = function () {
    subscriptions.ensureIndex({ profile : 1 });
    articles.ensureIndex({ subscription : 1 });
    articles.ensureIndex({ link : 1 });
    articles.ensureIndex({ starred : 1 });
    articles.ensureIndex({ read : 1 });
};

module.exports.ensureIndexes = ensureIndexes;
 
    