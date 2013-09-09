var   config = require('../config')
    , mongodb = require('mongodb')
    , url = require('url')
    , ObjectID = require('mongodb').ObjectID
    , dbServer = new mongodb.Server(config.db.host, config.db.port)
    , db = new mongodb.Db('pushfeed', dbServer, {w:0})
    , FeedParser = require('feedparser')
    , request = require('request')
    , dns = require('dns')
    , StringReader = require('../stringreader')
    , Q = require('q');
    
var execute = function () {
    
    
    Q.ninvoke(db, 'open')
        .then(function () {
            var subscriptioninstances = db.collection('subscription_instances');
            
            return Q.ninvoke(subscriptions, 'find', {  });
        })
        .then (function (cursor) { 
            return Q.ninvoke(cursor, 'toArray');
        })
        
        .fin(function () { console.log('close'); db.close(); })
        .done();
    
};

execute();