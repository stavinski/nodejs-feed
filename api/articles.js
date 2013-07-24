var config = require('../config')
    , engine = require('tingodb')()
    , db = new engine.Db( config.db.path , {})
    , Q = require('q')
    , logger = require('../logger');
    
exports.getArticles = function(req, res) {
    var filter = {
        profile: config.profiles.id
    };
    
    var fetchFromCursor = function (cursor) {
        return Q.ninvoke(cursor, 'toArray');
    };
    
    var flattenArticles = function (articles) {
        var flattened = []
            , results = flattened.concat.apply(flattened, articles);
        
        results.sort(function (first, second) {
            return second.published - first.published;
        });
        
        return results;
    };
    
    Q.ninvoke(db, 'open')
        .then (function (db) {
            var   subscriptions = db.collection('subscriptions')
                , articles = db.collection('articles');
            Q.ninvoke(subscriptions, 'find', { profile : config.profiles.id })
                .then(fetchFromCursor)
                .then(function (subs) { 
                    var deferreds = [];
                                
                    subs.forEach(function (sub) {
                        var deferred = Q.defer();
                        
                        var filter = { 
                            subscription : sub._id,
                        };
                        
                        if ((!req.query.read) && (!req.query.starred)) filter.read = false;
                        if (req.query.read) filter.read = true;
                        if (req.query.starred) filter.starred = true;
                                                
                        Q.invoke(articles, 'find', filter, {content:0})
                            .then(fetchFromCursor)
                            .then(deferred.resolve)
                            .then(deferreds.push(deferred.promise));
                    }); 

                    return Q.all(deferreds);
            })
            .then(flattenArticles)
            .then(function (results) { res.json(results); })
        })
        .done();
            
};

exports.getArticle = function(req, res) {
    var id = req.params.id;
    Q.ninvoke(db, 'open')
        .then(function (db) {
            return db.collection('articles');
        })
        .then(function (articles) {
            return Q.ninvoke(articles, 'findOne', {_id : id});
        })
        .then(function (article) {
            res.json(article);
        })
        .done();
};

exports.update = function (req, res) {
    Q.ninvoke(db, 'open')
        .then(function (db) {
            var   articles = db.collection('articles')
                , subscriptions = db.collection('subscriptions');
            Q.ninvoke(articles, "findOne", { _id : req.params.id })
                .then(function (result) {
                    var read = (req.body.read == "true");
                    var starred = (req.body.starred == "true");
                    
                    articles.update({ _id : result._id }, { $set: { read : read, starred : starred } });
                                
                    if ((req.body.read) && (!result.read))
                        subscriptions.update({ _id: result.subscription }, { $inc : { unread : -1 } });            
                });
        })
        .fin(function () { res.end() })
        .done();
};