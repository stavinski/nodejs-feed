var config = require('../config')
    , mongodb = require('mongodb')
    , mongoskin = require('mongoskin')
    , ObjectID = require('mongodb').ObjectID
    , dbServer = new mongodb.Server(config.db.host, config.db.port)
    , skinServer = new mongoskin.SkinServer(dbServer)
    , db = skinServer.db('pushfeed', {w:0})
    , Q = require('q')
    , url = require('url');

exports.getAll = function(profile, since) {
    return Q.ninvoke(db, 'open')
            .then(function (profiles) {
                return Q.ninvoke(db.collection('profiles'), 'findOne', { _id : new ObjectID(profile) }, { _id : 0, subscriptions : 1 });
            })
            .then (function (result) {
                var filter = {
                    created : { $gte : new Date(since) },
                    _id : { $in : result.subscriptions }
                };
                var cursor = db.collection('subscriptions').find(filter, { sort : [['stitle', 1]] });
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

exports.upsert = function (meta) {
    var parseFavicon = function (meta) {
        if (meta.favicon != null) return meta.favicon;
        
        var   feedUrl = url.parse(meta.link)
            , host = feedUrl.protocol + "//" + feedUrl.hostname;
        
        return host + '/favicon.ico';
    };
    
    var parsePubSub = function (meta) {
        if (Object.keys(meta.cloud).length == 0) return null;
        
        return meta.cloud;
    };

    return Q.ninvoke(db, 'open')
            .then(function (db) {
                var   subscriptions = db.collection('subscriptions')
                    , data = {
                        created : new Date(),
                        favicon : parseFavicon(meta),
                        pubsub : parsePubSub(meta),
                        htmlurl : meta.htmlurl,
                        title : meta.title,
                        stitle : meta.title.toLowerCase(),
                        xmlurl : meta.xmlurl,
                        image : meta.image
                      };         
                
                return Q.ninvoke(subscriptions, 'findAndModify', { xmlurl : meta.xmlurl }, [['xmlurl', 1]], data, {w:1, upsert : true, new : true});
            })
            .fin(function () { db.close(); });
            
};