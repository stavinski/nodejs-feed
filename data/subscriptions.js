var config = require('../config')
    , mongodb = require('mongodb')
    , mongoskin = require('mongoskin')
    , ObjectID = require('mongodb').ObjectID
    , dbServer = new mongodb.Server(config.db.host, config.db.port)
    , skinServer = new mongoskin.SkinServer(dbServer)
    , db = skinServer.db('pushfeed', {w:0})
    , Q = require('q')
    , url = require('url');

exports.getAll = function(userId, since) {
    return Q.ninvoke(db, 'open')
            .then(function (db) {
                return db.collection('subscriptions');
            })
            .then(function (subscriptions) {
                var cursor = subscriptions.find({ profile: new ObjectID(userId), created : { $gte : new Date(since) } }, { sort : [['title', 1]] });
                return Q.ninvoke(cursor, 'toArray');
            })
            .fin(function () { db.close(); });
};

exports.get = function(id) {
    return Q.ninvoke(db, 'open')
        .then(function (db) {
            var subscriptions = db.collection('subscriptions');
            return Q.ninvoke(subscriptions, 'findOne', { _id : new ObjectID(id) });
        })
        .fin(function () { db.close(); });
};

exports.getByUrl = function (url) {
    return Q.ninvoke(db, 'open')
               .then(function (db) {
                    var subscriptions = db.collection('subscriptions');
                    return Q.ninvoke(subscriptions, 'findOne', { xmlurl : url });
               })
               .fin(function () { db.close(); });
};

exports.insert = function (meta) {
    var parseFavicon = function (meta) {
        if (meta.favicon != null) return meta.favicon;
        
        var   feedUrl = url.parse(meta.link)
            , host = feedUrl.protocol + "//" + feedUrl.hostname;
        
        return host + '/favicon.ico';
    };
    
    var parsePubSub = function (meta) {
        if (meta.cloud == null) return null;
        
        return meta.cloud;
    };

    return Q.ninvoke(db, 'open')
            .then(function (db) {
                var subscriptions = db.collection('subscriptions')
                    data = {
                        created : new Date(),
                        etag : '',
                        lastModified : '',
                        favicon : parseFavicon(meta),
                        pubsub : parsePubSub(meta),
                        lastPoll : new Date(0),
                        htmlurl : meta.htmlurl,
                        title : meta.title,
                        xmlurl : meta.xmlurl
                    };
                    
                return Q.ninvoke(subscriptions, 'insert', data, {w:1});
            })
            .fin(function () { db.close(); });
            
};