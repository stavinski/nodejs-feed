var   Q = require('q')
    , FeedParser = require('feedparser')
    , url = require('url')
    , dns = require('dns')
    , StringReader = require('./stringreader')
    , request = require('request');

var feed = {
    details : function (feedUrl) {
        var deferred = Q.defer()
            , host = url.parse(feedUrl).hostname;
                
        dns.resolve(host, function (err) {
            if (err) {
                deferred.reject(err);
            } else {
                request(feedUrl).pipe(new FeedParser())
                    .on('error' , deferred.reject)
                    .on('meta', function (meta) {
                        // some feeds do not provide the actual xml url, :-/
                        // in which case just use the feed url provided
                        if (meta.xmlurl == null) 
                            meta.xmlurl = feedUrl.toLowerCase();
                                                
                        deferred.resolve(meta);
                    });
            }
        });
        
        return deferred.promise;
    },
    articles : function (feedUrl) {
        var host = url.parse(feedUrl).hostname;
                
        return Q.ninvoke(dns, 'resolve', host)
                .then(function () {
                    var   deferred = Q.defer()
                        , results = [];
                    
                    request(feedUrl)
                        .on('error', deferred.reject)
                        .pipe(new FeedParser({ addmeta : false }))
                        .on ('error', deferred.reject)
                        .on('readable', function () {
                            var   stream = this
                                , item = null;
                                
                            while (item = stream.read()) {
                                results.push(item);
                            }
                        })
                        .on('end', function () { deferred.resolve(results); });
                                                
                    return deferred.promise;
                });    
    },
    parse : function (content) {
        var   sr = new StringReader(content)
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
    }
};

module.exports = feed;