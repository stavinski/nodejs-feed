var config = require('../config')
    , mongodb = require('mongodb')
    , dbServer = new mongodb.Server(config.db.host, config.db.port)
    , db = new mongodb.Db('pushfeed', dbServer, {w:0,auto_reconnect: true})
    , Q = require('q')
    , logger = require('../logger')
    , subscriptions = db.collection('subscriptions')
    , articles = db.collection('articles')
    , archivedArticles = db.collection('archivedarticles');

var ensureIndexes = function () {
        
    subscriptions.ensureIndex({ profile : 1 });
    articles.ensureIndex({ subscription : 1 });
    articles.ensureIndex({ starred : 1 });
    articles.ensureIndex({ read : 1 });
    articles.ensureIndex({ published : 1 });
    archivedArticles.ensureIndex({ profile : 1, hash : 1 });
};

module.exports.ensureIndexes = ensureIndexes;
 
    