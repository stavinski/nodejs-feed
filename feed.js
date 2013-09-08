var   Q = require('q')
    , FeedParser = require('feedparser')
    , url = require('url')
    , dns = require('dns')
    , request = require('request');

var feed = {
    details : function (feedUrl) {
        var deferred = Q.defer()
            , host = url.parse(feedUrl).hostname;
        
        request('http://84.246.200.245/rss/').pipe(new FeedParser())
                    .on('error' , deferred.reject)
                    .on('meta', deferred.resolve);
        
        /*
        dns.resolve(host, function (err) {
            if (err) {
                deferred.reject(err);
            } else {
                request(feedUrl).pipe(new FeedParser())
                    .on('error' , deferred.reject)
                    .on('meta', deferred.resolve);
            }
        });
        */
    
        return deferred.promise;
    }
};

module.exports = feed;