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
    , Q = require('q');
    
var execute = function () {
    var subscription = bus.subscribe('foo', function (msg){
        console.log(msg);
        bus.close();
    });
        
    bus.publish('foo', { timestamp: new Date() });
};

execute();