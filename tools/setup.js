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
    , summary = require('../data/summary')
    , feed = require('../feed')
    , Q = require('q');
    
var execute = function () {
    summary.getForProfile("51fcf8f50b4f238839000001")
        .then(function (results) {
            console.log(results);  
        })
        .done();
};

execute();