var config = require('../config')
    , mongodb = require('mongodb')
    , mongoskin = require('mongoskin')
    , ObjectID = require('mongodb').ObjectID
    , dbServer = new mongodb.Server(config.db.host, config.db.port)
    , skinServer = new mongoskin.SkinServer(dbServer)
    , db = skinServer.db('pushfeed', {w:0})
    , Q = require('q')
    , logger = require('../logger');

var mapSubscriptions = function (subscription) {
    return new ObjectID(subscription);
};
    
exports.getUnread = function(profile, since) {
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
                                starred : { $ne : new ObjectID(profile) }
                           };
                           
            var cursor = db.collection('articles').find(filter, { sort : [['published', -1]], content : 0, summary : 0, read : 0, starred : 0, w:1 });
            return Q.ninvoke(cursor, 'toArray');
        })
        .fin(function () { db.close(); });     
};

exports.get = function(id) {
    return Q.ninvoke(db, 'open')
            .then(function (db) {
                return db.collection('articles');
            })
            .then(function (articles) {
                return Q.ninvoke(articles, 'findOne', {_id : new ObjectID(id) }, { read : 0, starred : 0 });
            })
            .fin(function () { db.close(); });
};

exports.upsert = function (subscription, articles) {
    Q.ninvoke(db, 'open')
        .then (function (db) {
            var deferreds = [];
            
            articles.forEach(function (article) {
                var   deferred = Q.defer()
                    , data = {
                        subscription : subscription._id,
                        title : article.title,
                        link : article.link,
                        origlink : article.origlink,
                        published : article.pubdate,
                        updated : article.date,
                        downloaded : new Date(),
                        author : article.author,
                        guid : article.guid,
                        categories : article.categories,
                        image : article.image,
                        source : article.source,
                        summary : article.summary,
                        content : article.description,
                        parent : subscription.title,
                        read : [],
                        starred : []
                    };
                
                deferreds.push(deferred.promise);
                Q.ninvoke(db.collection('articles'), 'findAndModify', { guid : article.guid }, [['guid', 1]], data, {w:1, upsert : true, new : true})
                    .fail(function (err) { console.log(err); })
                    .then(function () { deferred.resolve(); });
            });
            
            return Q.all(deferreds);
        })
        .fin(function () { db.close(); });
};

exports.read = function (profile, article) {
    Q.ninvoke(db, 'open')
        .then (function (db) {
            return Q.ninvoke(db.collection('articles'), 'update', { _id : article._id }, { $addToSet : { read : new ObjectID(profile) } }, {w:1});
        })
        .fin(function () { db.close(); });
};

exports.starred = function (profile, article) {
    Q.ninvoke(db, 'open')
        .then (function (db) {
            return Q.ninvoke(db.collection('articles'), 'update', { _id : new ObjectID(article) }, { $addToSet : { starred : new ObjectID(profile) } }, {w:1});
        })
        .fin(function () { db.close(); });
};

exports.unstarred = function (profile, article) {
    Q.ninvoke(db, 'open')
        .then (function (db) {
            return Q.ninvoke(db.collection('articles'), 'update', { _id : new ObjectID(article) }, { $pull : { starred : new ObjectID(profile) } }, {w:1});
        })
        .fin(function () { db.close(); });
};