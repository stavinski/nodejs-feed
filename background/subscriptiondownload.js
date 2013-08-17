var   config = require('../config')
    , util = require('util')
    , crypto = require('crypto')
    , Q = require('q')
    , mongodb = require('mongodb')
    , ObjectID = require('mongodb').ObjectID
    , dbServer = new mongodb.Server(config.db.host, config.db.port)
    , db = new mongodb.Db('pushfeed', dbServer,{w:0})
    , logger = require('../logger')
    , FeedParser = require('feedparser')
    , request = require('request')
    , indexes = require('../db/indexes')
    , StringReader = require('../stringreader');
    
var downloadFailed = function (subscription, err) {
    if (err) {
        logger.error('subscriptiondownload', util.format('raised requesting subscription [%s]', subscription._id), err);
        return true;
    }
    
    return false;
}

var statusInvalid = function (subscription, status) {
    if (status == 304) {
        logger.debug('subscriptiondownload', util.format('subscription [%s] has not been modified since last request', subscription._id));
        return true;
    }

    if (status != 200) {
        logger.error('subscriptiondownload', util.format('subscription [%s] returned status [%s]', subscription._id, status), null);
        return true;
    }
        
    return false;
};

var processArticle = function(subscription, item) {
    var   hash = crypto.createHash('md5').update(item.guid).digest('hex')
        , articles = db.collection('articles', {w:1})
        , archivedArticles = db.collection('archivedarticles', {w:1})
        , deferred = Q.defer();
        
     archivedArticles.findOne({ profile : new ObjectID(config.profiles.id), hash : hash }, {w:1}, function (err, result) {
        if (err) {
            logger.error('subscriptiondownload', 'raised retrieving archived article', err);
            deferred.resolve();
        }
        
        // check if we have already downloaded this article or not
        if (result) {
            //logger.debug('subscriptiondownload', util.format('article [%s] has already been downloaded for this profile [%s]', item.title, config.profiles.id));
            deferred.resolve();
        } else {
           var   archivedArticle = {
                    hash : hash,
                    profile : new ObjectID(config.profiles.id),
                    title : item.title,
                    link : item.link,
                    at : new Date()
                  }
               , article = {
                        subscription : subscription._id,
                        link : item.link,
                        origlink : item.origlink,
                        title : item.title,
                        published : item.pubdate,
                        updated : item.date,
                        downloaded : new Date(),
                        starred : false,
                        read : false,
                        content : item.description,
                        summary : item.summary,
                        author : item.author
                  }
               , insertArchivedArticle = Q.ninvoke(archivedArticles, 'insert', archivedArticle)
               , insertArticle = Q.ninvoke(articles, 'insert', article);
                
            Q.all([insertArchivedArticle, insertArticle])
                .fail(function (err) { logger.error('subscriptiondownload', 'raised when inserting article data', err); } )
                .fin(function () { deferred.resolve(); });
        }
     });
        
    return deferred.promise;
};    

var updateUnread = function (subscription) {
    var   subscriptions = db.collection('subscriptions')
        , articles = db.collection('articles');
    
    return Q.ninvoke(articles, 'count', { subscription : subscription._id, read: false })
                .then(function (result) { subscriptions.update({ _id : subscription._id }, { $set : { unread : count }}) });
};
    
var execute = function() {
    
    Q.ninvoke(db, 'open')
        .then(function () { return db.collection('subscriptions').find({ profile : new ObjectID(config.profiles.id) }); })
        .then(function (cursor) { return Q.ninvoke(cursor, 'toArray'); })
        .then(function (subscriptions) {
            var deferreds = [];
            subscriptions.forEach (function (subscription) {
                var  opts = {
                        url : subscription.xmlurl,
                        headers : { 
                                    'If-Modified-Since' : subscription.lastModified,
                                    'If-None-Match' : subscription.etag
                                  }
                      }
                    , deferred = Q.defer();

                 deferreds.push(deferred.promise);           
                 
                 request(opts, function(err, response, body) {
                    // check if the response can be processed or not
                    if ((downloadFailed(subscription, err)) || (statusInvalid(subscription, response.statusCode))) {
                        deferred.resolve();
                        return;
                    }
                   
                    var   sr = new StringReader(body)
                        , subscriptions = db.collection('subscriptions')
                        , articleDeferreds = [];
                                        
                    subscriptions.update({ _id : subscription._id }, { $set : { lastModified : response.headers['last-modified'], etag : response.headers['etag'] } });
                                                
                    sr.pipe(new FeedParser())
                        .on('error', function (err) { logger.error('subscriptiondownload', util.format('raised parsing subscription [%s]', subscription._id), err); })
                        .on('readable', function () {
                             var   stream = this
                                 , item = null;
                             
                             while (item = stream.read()) {
                                articleDeferreds.push(processArticle(subscription, item));
                             }
                        });
                    
                    Q.all(articleDeferreds)
                        //.then(function () { return updateUnread(subscription); })
                        .then(function () { deferred.resolve() });
                    
                    // tell string reader to buffer through stream
                    sr.resume();
                 });                 
            });
            return Q.all(deferreds);
        })
        .fin(function () { db.close(); })
        .done();
};

execute();