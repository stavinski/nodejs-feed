var config = require('../config')
    , mongodb = require('mongoskin')
    , ObjectID = require('mongodb').ObjectID
    , db = new mongodb.db(config.db.url + 'pushfeed', {safe : true})
    , Q = require('q')
    , logger = require('../logger');

var closeConnection = function () {
    db.close();  
};

var mapSubscriptionIds = function (subscription) {
    return subscription._id;  
};

var getUnread = function (db, profile, subscriptions, since) {
    var  filter = {
                    downloaded : { $gte : new Date(since) },
                    subscription : { $in : subscriptions },
                    read : { $ne : new ObjectID(profile) },
                    starred : { $ne : new ObjectID(profile) }
               };
    var cursor = db.collection('articles').find(filter, { read : 0, starred : 0 }, { sort : [['published', -1]], w:1, limit : 80 });
    return Q.ninvoke(cursor, 'toArray')
            .then(function (articles) {
                return articles.map(function (article) {
                    article.read = false;
                    article.starred = false;
                    article.summary = article.content.substring(0, 100) + '...';
                    return article;
                });  
            });
};

var getRead = function (db, profile, subscriptions, since) {
    var  filter = {
                    downloaded : { $gte : new Date(since) },
                    subscription : { $in : subscriptions },
                    read : new ObjectID(profile),
                    starred : { $ne : new ObjectID(profile) }
               };
    var cursor = db.collection('articles').find(filter, { read : 0, starred : 0 }, { sort : [['published', -1]], w:1, limit : 50 });
    return Q.ninvoke(cursor, 'toArray')
            .then(function (articles) {
                return articles.map(function (article) {
                    article.read = true;
                    article.starred = false;
                    article.summary = article.content.substring(0, 100) + '...';
                    return article;
                });  
            });
};

var getStarred = function (db, profile, subscriptions, since) {
    var filter = {
                    downloaded : { $gte : new Date(since) },
                    subscription : { $in : subscriptions },
                    read : { $ne : new ObjectID(profile) },
                    starred : new ObjectID(profile)
               };
    var cursor = db.collection('articles').find(filter, { read : 0, starred : 0 }, { sort : [['published', -1]], w:1, limit : 80 });
    return Q.ninvoke(cursor, 'toArray')
            .then(function (articles) {
                return articles.map(function (article) {
                    article.read = false;
                    article.starred = true;
                    article.summary = article.content.substring(0, 100) + '...';
                    return article;
                });  
            });
};

exports.getForProfile = function(profile, since, subscription) {
    return Q.ninvoke(db, 'open')
        .then (function () {
            if (subscription) {
                // filtered by a particular subscription
                return [new ObjectID(subscription)];
            } else {
                return Q.ninvoke(db.collection('profiles'), 'findOne', { _id : new ObjectID(profile) }, { _id : 0, subscriptions : 1 })
                        .then(function (result) { return result.subscriptions.map(mapSubscriptionIds); });
            }        
         })
         .then (function (subscriptions) {
             return [getUnread(db, profile, subscriptions, since),
                     getRead(db, profile, subscriptions, since),
                     getStarred(db, profile, subscriptions, since)];
        })
        .spread(function (unread, read, starred) {
            var articles = unread.concat(read)
                                 .concat(starred);
            articles.sort(function (prev, next) {
                var prevDate = new Date(prev.published)
                    , nextDate = new Date(next.published);
                return nextDate - prevDate;
            });
            return articles;
        })
        .fin(function () { db.close(); });    
};

exports.get = function(profile, id) {
    return Q.ninvoke(db, 'open')
            .then(function () {
                // the handling of starred/read is a bit pants at the mo, hopefully be able to use $elemMatch 
                // if i can ever get mongodb updated on raspberry pi to >= 2.2
                
                var deferred = Q.defer();
                db.collection('articles').findOne({_id : new ObjectID(id), starred : new ObjectID(profile) }, { read : 0, starred : 0 }, {w:1}, function (err, starred) {
                    if (err) throw err;
                    
                    if (starred != null) {
                        starred.starred = true;
                        starred.read = false;
                        deferred.resolve(starred);                            
                    }
                });
                          
                db.collection('articles').findOne({_id : new ObjectID(id), read : new ObjectID(profile) }, { read : 0, starred : 0 }, {w:1}, function (err, read) {
                    if (err) throw err;
                    
                    if (read != null) {
                        read.starred = false;
                        read.read = true;
                        deferred.resolve(read);                            
                    }
                });
                db.collection('articles').findOne({_id : new ObjectID(id), starred : { $ne : new ObjectID(profile) }, read : { $ne : new ObjectID(profile) } }, { read : 0, starred : 0 }, {w:1}, function (err, unread) {
                    if (err) throw err;
                    
                    if (unread != null) {
                        unread.starred = false;
                        unread.read = false;
                        deferred.resolve(unread);                            
                    }
                });
                
                return deferred.promise;                
            })
            .then(function (result) { 
                db.close(); 
                return result; 
            });
};

exports.upsert = function (subscription, articles) {
    var articleUpsert = function (db, article) {
        var data = {
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
                
        return Q.ninvoke(db.collection('articles'), 'update', { guid : article.guid }, data, {w:1, upsert : true})
                .then(function (results) {
                    var   upsert = results[1]
                        , existing = upsert.updatedExisting;
                    
                    // yuck! hack to get round the non support of $setOnInsert, when using newer version >= 2.4 remove this and uncomment
                    // in above update upsert
                    if (!existing) {
                        return Q.ninvoke(db.collection('articles'), 'update', { guid : article.guid }, { $set : { downloaded : new Date() , read : [], starred : [] } }, {w:1})
                                .then(function () { return existing; });
                    } else {
                        return existing;
                    }                        
                });
    };
    
    return Q.ninvoke(db, 'open')
            .then(function () {
                return Q.all(articles.map(function (article) {
                    return articleUpsert(db, article);   
                }));
            })
            .then(function (result) {
                db.close();
                return result;
            })
            .fail(closeConnection);
};

exports.read = function (profile, article) {
    return Q.ninvoke(db, 'open')
            .then (function (db) {
                return Q.ninvoke(db.collection('articles'), 'update', { _id : article._id }, { $addToSet : { read : new ObjectID(profile) } }, {w:1});
            })
            .fin(function () { db.close(); });
};

exports.unread = function (profile, article) {
    return Q.ninvoke(db, 'open')
            .then (function (db) {
                return Q.ninvoke(db.collection('articles'), 'update', { _id : article._id }, { $pull : { read : new ObjectID(profile) } }, {w:1});
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