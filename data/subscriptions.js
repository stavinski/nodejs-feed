var   config = require('../config')
    , mongodb = require('mongoskin')
    , ObjectID = require('mongodb').ObjectID
    , db = new mongodb.db(config.db.url + 'pushfeed', {safe : true})
    , Q = require('q')
    , url = require('url');

var mapSubscriptionIds = function (subscription) {
    return subscription._id;  
};

exports.getAllByProfile = function(profile, since) {
    return Q.ninvoke(db, 'open')
            .then(function (profiles) {
                return Q.ninvoke(db.collection('profiles'), 'findOne', { _id : new ObjectID(profile) }, { _id : 0, subscriptions : 1 });
            })
            .then (function (result) {
                var filter = {
                    created : { $gte : new Date(since) },
                    _id : { $in : result.subscriptions.map(mapSubscriptionIds) }
                };
                var cursor = db.collection('subscriptions').find(filter, { sort : [['stitle', 1]] });
                return Q.ninvoke(cursor, 'toArray')
                        .then(function (results) {
                            return { subscriptions : results, additionals : result.subscriptions };    
                        });
            })
            .then(function (results) {
                return results.subscriptions.map(function (subscription) {
                    var matches = results.additionals.filter(function (additional) {
                        return subscription._id.equals(additional._id);
                    });
                    
                    var match = matches[0];
                    subscription.title = match.title;
                    subscription.stitle = match.stitle;
                    subscription.category = match.category;
                    
                    return subscription;
                });                
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
        var parseUrl = function (location) {
            var   feedUrl = url.parse(location)
                , host = feedUrl.protocol + "//" + feedUrl.hostname;
        
            return host + '/favicon.ico';
        };
        
        if (meta.favicon != null) return meta.favicon; // use supplied as preference
        if (meta.link) return parseUrl(meta.link); // then the website 
        return parseUrl(meta.xmlurl); // then the feed which could be a feed provider (i.e. feedburner)
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
                            htmlurl : meta.link,
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
                                Q.ninvoke(subscriptions, 'findOne', { xmlurl : meta.xmlurl }, {}, {w:1})
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
                    , pollCheck = now.setMinutes(now.getMinutes() - config.background.subscriptionPollMins);

                return Q.ninvoke(db.collection('subscriptions'), 'findOne', { 'pubsub.type' : { $ne : 'hub' }, lastPoll : { $lte : new Date(pollCheck) } }, {}, { sort : [['lastPoll',1]], limit : 1 });
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
                return Q.ninvoke(db.collection('subscriptions'), 'update', { _id : subscription._id }, { $set: { lastModified : lastModified , etag : etag } }, {w:1});
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
                return Q.ninvoke(db.collection('subscriptions'), 'update', { _id : subscription._id }, { $set : { 'pubsub.verified' : new Date(), 'pubsub.expires' : expires } }, {w:1});
            })
            .fin(function () { db.close(); })
};

exports.unsubscribe = function (subscription) {
    return Q.ninvoke(db, 'open')
            .then(function (db) {
                return Q.ninvoke(db.collection('subscriptions'), 'update', { _id : subscription._id }, { $set : { 'pubsub.unsubscribed' : new Date() } }, {w:1});
            })
            .fin(function () { db.close(); })
};

exports.getForPubSubRenewal = function () {
  return Q.ninvoke(db, 'open')
        .then(function (db) {
            var   now = new Date()
                , expireThreshold = new Date(now.setDate(now.getDate() + 1)) // any that are going to expire in less than a day
                , cursor = db.collection('subscriptions').find({ 'pubsub.type' : 'hub', 'pubsub.expires' : { $lte : expireThreshold } }, { sort : [['pubsub.expires',1]] });
            
            return Q.ninvoke(cursor, 'toArray');
        })
        .fin(function () { db.close(); })
};