var   config = require('../config')
    , util = require('util')
    , crypto = require('crypto')
    , Q = require('q')
    , mongodb = require('mongoskin')
    , ObjectID = require('mongodb').ObjectID
    , db = new mongodb.db(config.db.url + 'pushfeed', {safe : true})
    , logger = require('../logger')
    , FeedParser = require('feedparser')
    , request = require('request')
    , subscriptions = require('../data/subscriptions')
    , articles = require('../data/articles')
    , StringReader = require('../stringreader')
    , bus = require('../bus');

var handleDownload = function (subscription, results) {
    var   response = results[0]
        , body = results[1];
    
    // the feed has not been modified since last time we checked
    if (response.statusCode == 304) {
        return { proceed : false };
    }
    
    // had an issue downloading feed so mark it as in error
    if (response.statusCode != 200) {
        subscriptions.setError(subscription, true)
                     .then(function () { return { proceed : false } });
    }
    
    // all is good so return the feed response and body
    return subscriptions.setError(subscription, false)
                        .then(function () { return { proceed : true, response : response, body : body } });
};

var parseFeed = function (body) {
    var   sr = new StringReader(body)
        , results = []
        , deferred = Q.defer();
        
    sr.pipe(new FeedParser())
        .on('error', deferred.reject)
        .on('readable', function () {
             var   stream = this
                 , item = null;
             
             while (item = stream.read()) {
                results.push(item);
             }
        })
        .on('end', function () { deferred.resolve(results); });
    
    sr.resume();
    return deferred.promise;
};

var updateSubscription = function (subscription) {
    var opts = {
        url : subscription.xmlurl,
        headers : {
            'If-Modified-Since' : subscription.lastModified,
            'If-None-Match' : subscription.etag
        }
    };
    
    return subscriptions.setLastPoll(subscription)
            .then(function () { return Q.nfcall(request, opts) })
            .then(function (results) { return handleDownload(subscription, results); })
            .then(function (results) {
                // there was an issue
                if (!results.proceed) return [];
            
                return subscriptions.setPollingData(subscription, results.response.headers['last-modified'], results.response.headers['etag'])
                        .then(function () { return parseFeed(results.body) });
            })
            .then(function (downloaded) {
                return articles.upsert(subscription, downloaded);
            })
            .then(function (result) {
                // check whether there were any new articles
                var allExisting = result.every(function (existing) { return existing == true; });
                                
                if (!allExisting) {
                    bus.publish('bg.articlesupdated', { timestamp : new Date(), subscription : subscription });
                }
            })
            .fail(function (err) { console.log(err); console.log('Could not download feed data for subscription: [%s] - [%s]', subscription.xmlurl, subscription.title); });
};
    
var execute = function() {
    console.log('download bg task');
    subscriptions.getForPolling()
        .then(function (subscriptions) {
            console.log(subscriptions.length);
            return Q.all(subscriptions.map(updateSubscription));
        })
        //.fin (function () { console.log('end'); })
        .done();
    
    setTimeout(execute, config.background.pollMs);
};

module.exports.start = function () {
    execute();
};