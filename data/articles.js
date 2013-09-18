var config = require('../config')
    , mongodb = require('mongoskin')
    , ObjectID = require('mongodb').ObjectID
    , db = new mongodb.db(config.db.url + 'pushfeed', {safe : true})
    , Q = require('q')
    , logger = require('../logger');

var mapSubscriptions = function (subscription) {
    return new ObjectID(subscription);
};
    
exports.getUnread = function(profile, since, subscription) {
    return Q.ninvoke(db, 'open')
        .then (function (db) {
            if (subscription) {
                // filtered by a particular subscription
                return [new ObjectID(subscription)];
            } else {
                return Q.ninvoke(db.collection('profiles'), 'findOne', { _id : new ObjectID(profile) }, { _id : 0, subscriptions : 1 })
                        .then(function (result) { return result.subscriptions; });
            }        
         })
         .then (function (subscriptions) {
            var  filter = {
                            downloaded : { $gte : new Date(since) },
                            subscription : { $in : subscriptions },
                            read : { $ne : new ObjectID(profile) },
                            starred : { $ne : new ObjectID(profile) }
                       };
            var cursor = db.collection('articles').find(filter, { content : 0, read : 0, starred : 0 }, { sort : [['published', -1]], w:1, limit : 100 });
            return Q.ninvoke(cursor, 'toArray');
        })
        .fin(function () { db.close(); });     
};

exports.getRead = function(profile, since) {
    return Q.ninvoke(db, 'open')
        .then (function (db) {
            return Q.ninvoke(db.collection('profiles'), 'findOne', { _id : new ObjectID(profile) }, { _id : 0, subscriptions : 1 });
         })
         .then (function (result) {
            var   subscriptions = result.subscriptions
                , filter = {
                                downloaded : { $gte : new Date(since) },
                                subscription : { $in : subscriptions },
                                read : new ObjectID(profile),
                                starred : { $ne : new ObjectID(profile) }
                           };
            var cursor = db.collection('articles').find(filter, { content : 0, read : 0, starred : 0 }, { sort : [['published', -1]], w:1, limit : 100 });
            return Q.ninvoke(cursor, 'toArray');
        })
        .fin(function () { db.close(); });     
};

exports.getStarred = function(profile, since) {
    return Q.ninvoke(db, 'open')
        .then (function (db) {
            return Q.ninvoke(db.collection('profiles'), 'findOne', { _id : new ObjectID(profile) }, { _id : 0, subscriptions : 1 });
         })
         .then (function (result) {
            var   subscriptions = result.subscriptions
                , filter = {
                                downloaded : { $gte : new Date(since) },
                                subscription : { $in : subscriptions },
                                read : { $ne : new ObjectID(profile) },
                                starred : new ObjectID(profile)
                           };
            var cursor = db.collection('articles').find(filter, { content : 0, read : 0, starred : 0 }, { sort : [['published', -1]], w:1 });
            return Q.ninvoke(cursor, 'toArray');
        })
        .fin(function () { db.close(); });     
};

exports.get = function(profile, id) {
    return Q.ninvoke(db, 'open')
            .then(function (db) {
                return db.collection('articles');
            })
            .then(function (articles) {
                // the handling of starred is a bit pants at the mo, hopefully be able to use $elemMatch 
                // if i can ever get mongodb updated on raspberry pi to >= 2.2
                return Q.ninvoke(articles, 'findOne', {_id : new ObjectID(id), starred : new ObjectID(profile) }, { read : 0, starred : 0 }, {w:0})
                        .then(function (result) {
                            if (result != null) {
                                result.starred = true;
                                return result;
                            } else {
                                return Q.ninvoke(articles, 'findOne', {_id : new ObjectID(id) }, { read : 0, starred : 0 }, {w:0})
                                        .then(function (result) {
                                            result.starred = false;
                                            return result;
                                        });
                            }
                        })
            })
            .fin(function () { db.close(); });
};

exports.upsert = function (subscription, articles) {
    return Q.ninvoke(db, 'open')
            .then (function (db) {
                var deferreds = [];
                
                articles.forEach(function (article) {
                    var   deferred = Q.defer()
                        , data = {
                            //$setOnInsert : { downloaded : new Date() }, not supported in the version im running 2.1 :-/
                            $set : {
                                subscription : subscription._id,
                                title : article.title,
                                link : article.link,
                                origlink : article.origlink,
                                published : article.pubdate,
                                updated : article.date,
                                author : article.author,
                                guid : article.guid,
                                categories : article.categories,
                                image : article.image,
                                source : article.source,
                                content : article.description,
                                parent : subscription.title
                            }
                        };
                    
                    deferreds.push(deferred.promise);
                    Q.ninvoke(db.collection('articles'), 'update', { guid : article.guid }, data, {w:1, upsert : true})
                        .fail(function (err) { deferred.reject(err); })
                        .then(function (results) {
                            var   upsert = results[1]
                                , existing = upsert.updatedExisting;
                            
                            // yuck! hack to get round the non support of $setOnInsert, when using newer version >= 2.4 remove this and uncomment
                            // in above update upsert
                            if (!existing) {
                                Q.ninvoke(db.collection('articles'), 'update', { guid : article.guid }, { $set : { downloaded : new Date() , read : [], starred : [] } }, {w:1})
                                    .then(function () { deferred.resolve(existing); });
                            } else {
                                deferred.resolve(existing);
                            }                        
                        });
                });
                
                return Q.all(deferreds);
            })
            .fin(function () { db.close(); });
};

exports.read = function (profile, article) {
    return Q.ninvoke(db, 'open')
            .then (function (db) {
                return Q.ninvoke(db.collection('articles'), 'update', { _id : article._id }, { $addToSet : { read : new ObjectID(profile) } }, {w:1});
            })
            .fin(function () { db.close(); });
};

exports.starred = function (profile, article) {
    return Q.ninvoke(db, 'open')
            .then (function (db) {
                return Q.ninvoke(db.collection('articles'), 'update', { _id : new ObjectID(article) }, { $addToSet : { starred : new ObjectID(profile)}, $pull : { read : new ObjectID(profile) } }, {w:1});
            })
            .fin(function () { db.close(); });
};

exports.unstarred = function (profile, article) {
    return Q.ninvoke(db, 'open')
            .then (function (db) {
                return Q.ninvoke(db.collection('articles'), 'update', { _id : new ObjectID(article) }, { $addToSet : { read : new ObjectID(profile) }, $pull : { starred : new ObjectID(profile) } }, {w:1});
            })
            .fin(function () { db.close(); });
};