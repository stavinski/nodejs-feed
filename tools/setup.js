var   config = require('../config')
    , mongodb = require('mongoskin')
    , ObjectID = require('mongodb').ObjectID
    , db = new mongodb.db(config.db.url + 'pushfeed', {safe : true})
    , url = require('url')
    , FeedParser = require('feedparser')
    , request = require('request')
    , dns = require('dns')
    , StringReader = require('../stringreader')
    , bus = require('../bus')
    , pubsub = require('../background/pubsub')
    , subscriptions = require('../data/subscriptions')
    , Q = require('q');
    
var execute = function () {
     subscriptions.getForPubSubRenewal()
        .then(function (results) {
            console.log(results);
        })
        .done();
};

execute();