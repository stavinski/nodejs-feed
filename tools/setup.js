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
    , feed = require('../feed')
    , Q = require('q');
    
var execute = function () {
    feed.details('http://massively.joystiq.com/rss.xml')
        .then(function (details) { console.log(details); })
        .done();
};

execute();