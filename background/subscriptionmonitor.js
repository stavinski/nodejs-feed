var config = require('../config')
    , engine = require('tingodb')()
    , db = new engine.Db( config.db.path , {})    
    , subscriptions = db.collection('subscriptions')
    , feedParser = require('feedparser')
    , request = require('request');

var execute = function() {
    subscriptions.find({ profile : config.profiles.id, _id : 3 }).toArray(function(err, docs) {
        if (err) throw err;
        
        docs.forEach(function (subscription) {
            
            var opts = {
                url : subscription.url,
                headers : { 'If-None-Match' : subscription.etag, 
                            'If-Modified-Since' : subscription.lastModified 
                          }
            };
            
            request(opts, function (err, response, body) {
                if (err) throw err;
                
                // content has not changed since we last checked
                if (response.statusCode == 304) return;
                
                // save away the etag and last modified for next request
                var   etag = response.headers['etag']
                    , lastModified = response.headers['last-modified'];
                
                // parse feed here
                // do insert 
                // update etag & lastModified
                                
                subscriptions.update({ _id : subscription._id }, { $set : { etag : etag, lastModified : lastModified } }, {w:1}, function (err, results) {
                    if (err) throw err;
                                        
                });
            });
        
        });
    });
};    
    
execute();