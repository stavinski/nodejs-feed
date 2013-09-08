var config = require('../config')
    , mongodb = require('mongodb')
    , ObjectID = require('mongodb').ObjectID
    , dbServer = new mongodb.Server(config.db.host, config.db.port)
    , db = new mongodb.Db('pushfeed', dbServer, {w:0})
    , Q = require('q')
    , logger = require('../logger');
    
exports.getAll = function(userId, filter, since) {
    var flattenArticles = function (articles) {
        var flattened = []
            , results = flattened.concat.apply(flattened, articles);
        
        results.sort(function (first, second) {
            return second.published - first.published;
        });
        
        return results;
    };
    
    return Q.ninvoke(db, 'open')
        .then (function (db) {
            var   subscriptions = db.collection('subscriptions')
                , articles = db.collection('articles');
            
            return Q.ninvoke(subscriptions, 'find', { profile : new ObjectID(userId) })
                .then(function (cursor) { return Q.ninvoke(cursor, 'toArray'); })
                .then(function (subs) { 
                    var deferreds = [];
                    
                    subs.forEach(function (sub) {
                        var   deferred = Q.defer()
                            , query = { read : false, downloaded : { $gte : new Date(since) } };
                        deferreds.push(deferred.promise);
                                            
                        query.subscription = sub._id;
                        if (filter === 'read') query.read = true;  
                        if (filter === 'starred') query.starred = true;
                                                      
                        var cursor = articles.find(query, { content: 0, summary: 0 });
                        Q.ninvoke(cursor, 'toArray')
                         .then(function (articles) { deferred.resolve(articles); });
                                                     
                    }); 

                    return Q.all(deferreds);
            })
            .then(flattenArticles);
        })
        .fin(function () { db.close(); });
            
};

exports.get = function(id) {
    return Q.ninvoke(db, 'open')
            .then(function (db) {
                return db.collection('articles');
            })
            .then(function (articles) {
                return Q.ninvoke(articles, 'findOne', {_id : new ObjectID(id) });
            })
            .fin(function () { db.close(); });
};

exports.update = function (req, res) {
    Q.ninvoke(db, 'open')
        .then(function (db) {
            var   articles = db.collection('articles')
                , subscriptions = db.collection('subscriptions');
            Q.ninvoke(articles, "findOne", { _id : new ObjectID(req.params.id) })
                .then(function (result) {
                    var read = (req.body.read == "true");
                    var starred = (req.body.starred == "true");
                    
                    articles.update({ _id : result._id }, { $set: { read : read, starred : starred } });
                                
                    //if ((req.body.read) && (!result.read))
                    //    subscriptions.update({ _id: result.subscription }, { $inc : { unread : -1 } });            
                });
        })
        .fin(function () { 
            res.end();
            db.close(); 
         })
        .done();
};