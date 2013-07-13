var config = require('../config')
    , engine = require('tingodb')()
    , db = new engine.Db( config.db.path , {})    
    , subscriptions = db.collection('subscriptions')
    , articles = db.collection('articles')
    , nodePie = require('nodepie')
    , request = require('request')
    , indexes = require('../db/indexes');
    
var execute = function() {
    
    indexes.ensureIndexes();

    subscriptions.find({ profile : config.profiles.id }).toArray(function(err, docs) {
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
                    , lastModified = response.headers['last-modified']
                    , feed = new nodePie(body);
                
                feed.init();
                
                var   items = feed.getItems(0)
                    , articlesInserted = 0;
                items.forEach(function (item) {
                    articles.findOne({ link: item.getPermalink() }, function (err, article) {
                        if (err) throw err;
                        
                        // if we dont already have an article already saved
                        if (article == null) {
                            article = {
                                subscription : subscription._id,
                                link : item.getPermalink(),
                                title : item.getTitle(),
                                published : item.getDate(),
                                starred : false,
                                read : false,
                                content : item.getContents(),
                                author : item.getAuthor()
                            };
                            
                            articles.insert(article, {w:1}, function (err, doc) {
                                if (err) throw err; 
                                
                                articlesInserted++;
                            });
                        }
                    });
                });
                                                
                subscriptions.update({ _id : subscription._id }, { $set : { etag : etag, lastModified : lastModified }, $inc : { unread: articlesInserted } }, {w:1}, function (err, results) {
                    if (err) throw err;
                                        
                });
            });
        
        });
    });
};

execute();