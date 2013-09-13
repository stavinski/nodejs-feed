var config = require('../config')
    , mongodb = require('mongoskin')
    , ObjectID = require('mongodb').ObjectID
    , db = new mongodb.db(config.db.url + 'pushfeed', {safe : true})
    , Q = require('q')
    , url = require('url');

exports.getAllByProfile = function(profile, since) {
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
        if (meta.image.url) return meta.image.url;
        if (meta.link) {        
            var   feedUrl = url.parse(meta.link)
                , host = feedUrl.protocol + "//" + feedUrl.hostname;
        
            return host + '/favicon.ico';
        }
        
        return null;
    };
    
    var parsePubSub = function (meta) {
        if (Object.keys(meta.cloud).length == 0) return null;
    
        return meta.cloud;
    };

    return Q.ninvoke(db, 'open')
            .then(function (db) {
                var   subscriptions = db.collection('subscriptions')
                    , data = {
                        //$setOnInsert : { created : new Date() }, not supported in the version im running 2.1 :-/
                        $set : { 
                            favicon : parseFavicon(meta),
                            pubsub : parsePubSub(meta),
                            htmlurl : meta.htmlurl,
                            title : meta.title,
                            stitle : meta.title.toLowerCase(),
                            xmlurl : meta.xmlurl,
                            image : meta.image
                        }
                      };         
                
                return Q.ninvoke(subscriptions, 'update', { xmlurl : meta.xmlurl }, data, {w:1, upsert : true })
                        .then(function (results) {
                            var   upsert = results[1]
                                , existing = upsert.updatedExisting
                                , deferred = Q.defer();
                                                        
                            // yuck! hack to get round the non support of $setOnInsert, when using newer version >= 2.4 remove this and uncomment
                            // in above update upsert
                            if (!existing) {
                                var insertData = { $set : { created : new Date(), etag : '', lastModified : '', lastPoll : new Date(0) } };
                                Q.ninvoke(subscriptions, 'findAndModify', { xmlurl : meta.xmlurl }, [['xmlurl',1]], insertData, {w:1, new:true})
                                    .then(function (updated) { deferred.resolve({existing : existing, subscription : updated[0]}); })
                                    .fail(deferred.reject);
                            } else {
                                Q.ninvoke(subscriptions, 'findOne', { xmlurl : meta.xmlurl }, {w:1})
                                    .then(function (result) { deferred.resolve({ existing : existing, subscription : result }) })
                                    .fail(deferred.reject);
                            }
                            
                            return deferred.promise;
                        });
            })
            .fin(function () { db.close(); });
            
};

exports.getForPolling = function () {
    return Q.ninvoke(db, 'open')
            .then(function (db) {
                var   now = new Date()
                    , pollCheck =  new Date(); //now.setMinutes(now.getMinutes() - config.background.subscriptionPollMins);
                
                var cursor = db.collection('subscriptions').find({ 'pubsub.type' : { $ne : 'hub' }, lastPoll : { $lte : new Date(pollCheck) } }, { sort : [['lastPoll',1]] });
                return Q.ninvoke(cursor, 'toArray');
            })
            .fin(function () { db.close(); });
};

exports.setError = function (subscription, inError) {
    return Q.ninvoke(db, 'open')
            .then(function (db) {
                return Q.ninvoke(db.collection('subscriptions'), 'update', { _id : subscription._id }, { $set : { inerror : inError } }, {w:1});
            })
            .fin(function () { db.close(); });
};

exports.setPollingData = function (subscription, lastModified, etag) {
    return Q.ninvoke(db, 'open')
            .then(function (db) {
                return Q.ninvoke(db.collection('subscriptions'), 'update', { _id : subscription._id }, { $set: { lastModified : lastModified }, $set : { etag : etag } }, {w:1});
            })
            .fin(function () { db.close(); });
};

exports.setLastPoll = function (subscription) {
    return Q.ninvoke(db, 'open')
            .then(function (db) {
                return Q.ninvoke(db.collection('subscriptions'), 'update', { _id : subscription._id }, { $set : { lastPoll : new Date() } }, {w:1});
            })
            .fin(function () { db.close(); });
};

exports.subscribe = function (subscription, expires) {
    return Q.ninvoke(db, 'open')
            .then(function (db) {
                return Q.ninvoke(db.collection('subscriptions'), 'update', { _id : subscription._id }, { $set : { pubsub : { verified : new Date(), expires : expires } } }, {w:1});
            })
            .fin(function () { db.close(); })
};

exports.unsubscribe = function (subscription) {
    return Q.ninvoke(db, 'open')
            .then(function (db) {
                return Q.ninvoke(db.collection('subscriptions'), 'update', { _id : subscription._id }, { $set : { pubsub : { unsubscribed : new Date() } } }, {w:1});
            })
            .fin(function () { db.close(); })
};