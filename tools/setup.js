var   config = require('../config')
    , mongodb = require('mongodb')
    , mongoskin = require('mongoskin')
    , ObjectID = require('mongodb').ObjectID
    , dbServer = new mongodb.Server(config.db.host, config.db.port)
    , skinServer = new mongoskin.SkinServer(dbServer)
    , db = skinServer.db('pushfeed', {w:0})
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