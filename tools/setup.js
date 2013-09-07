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
            var subscriptions = db.collection('subscriptions');
            return Q.ninvoke(subscriptions, 'find', {}, {limit:2});
        })
        .then (function (cursor) { 
            return Q.ninvoke(cursor, 'toArray');
        })
        .then (function (results) {
            var   subscriptions = db.collection('subscriptions')
                , items = []
                , defer = Q.defer();
                        
            results.forEach(function (subscription) {
                var host = url.parse(subscription.xmlurl).hostname;
                dns.resolve(host, function (err, result) {
                    if (err) {
                        console.log(err);
                        return;
                    } else {
                        request(subscription.xmlurl)
                            .pipe(new FeedParser())
                            .on('meta', function (meta) { items.push({subscription : subscription, meta : meta }); })
                            .on('error', function (err) { console.log(err); })
                            .on('finish', function () { console.log('finish'); });
                    }
                });
            });
            
            return defer.promise;
        })
        /*
        .then(function (results) {
            var deferreds = [];
            results.forEach(function (item) {
                var subscription = item.value.subscription
                    , meta = item.value.meta
                    , subscriptions = db.collection('subscriptions');
                
                var update = {
                    favicon: null
                };
                
                // sort out favicon
                if (meta.favicon != null) {
                    update.favicon = meta.favicon
                } else {
                    var   feedUrl = url.parse(meta.link)
                        , host = feedUrl.protocol + "//" + feedUrl.hostname;
                    update.favicon = host + '/favicon.ico';
                }
                
                console.log(meta.cloud);
                if (meta.cloud != null) {
                    update.pubsub = meta.cloud;
                }
                
                deferreds.push(Q.ninvoke(subscriptions, 'update', { _id : subscription._id }, { $set : update }));
            });
            return Q.all(deferreds);
        })
        */
        /*
        .then(function (results) {
            results.forEach(function (item) {
                var subscription = item.value.subscription
                    , meta = item.value.meta;
                
                console.log(subscription);
                console.log(meta);
            });
        })
        */
        .fin(function () { console.log('close'); db.close(); })
        .done();
    
};

execute();