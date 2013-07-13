var config = require('../config')
    , engine = require('tingodb')()
    , db = new engine.Db('../db/' , {})    
    , subscriptions = db.collection('subscriptions')
    , articles = db.collection('articles')
    , logger = require('../logger')
    , nodePie = require('nodepie')
    , request = require('request')
    , indexes = require('../db/indexes');
    
var execute = function() {
    
    indexes.ensureIndexes();
    
    subscriptions.find({ profile : config.profiles.id }).toArray(function(err, docs) {
        if (err) {
            logger.error('subscriptiondownload', err, 'raised while finding subscriptions by profile');
            return;
        }
                
        docs.forEach(function (subscription) {
                
            var opts = {
                url : subscription.url,
                headers : { 'If-None-Match' : subscription.etag, 
                            'If-Modified-Since' : subscription.lastModified 
                          }
            };
            
            logger.debug('subscriptiondownload', 'subscription url:' + subscription.url); 
            logger.debug('subscriptiondownload', 'subscription etag:' + subscription.etag); 
            logger.debug('subscriptiondownload', 'subscription last modified:' + subscription.lastModified); 
            
            request(opts, function (err, response, body) {
                if (err) {
                    logger.error('subscriptiondownload', err, 'raised requesting subscription feed');
                    return;
                }
                
                // content has not changed since we last checked
                if (response.statusCode == 304) {
                    logger.debug('subscriptiondownload', 'subscription:' + subscription.title + ' returned 304 status, no changes since last request'); 
                    return;
                }
                
                // if the response was not ok
                if (response.statusCode != 200) {
                    logger.debug('subscriptiondownload', 'subscription returned status:' + response.statusCode);
                    logger.debug('subscriptiondownload', 'request made: ' + opts.url);
                    logger.debug('subscriptiondownload', 'response body: ' + body);
                    logger.debug('subscriptiondownload', 'subscription title: ' + subscription.title);
                    return;
                }
                
                // save away the etag and last modified for next request
                var   etag = response.headers['etag']
                    , lastModified = response.headers['last-modified']
                    , feed = new nodePie(body);
                
                logger.debug('subscriptiondownload', 'subscription etag: ' + etag);
                logger.debug('subscriptiondownload', 'subscription last modified: ' + lastModified);
                
                feed.init();
                                                
                var   items = feed.getItems(0, 20)
                    , articlesInserted = 0;
                items.forEach(function (item) {
                    articles.findOne({ link: item.getLink() }, function (err, article) {
                        if (err) {
                            logger.error('subscriptiondownload', err, 'raised finding article by link');
                            return;
                        }
                        
                        // if we dont already have an article already saved
                        if (article == null) {
                            article = {
                                subscription : subscription._id,
                                link : item.getLink(),
                                title : item.getTitle(),
                                published : item.getDate(),
                                starred : false,
                                read : false,
                                content : item.getContents(),
                                author : item.getAuthor()
                            };
                            
                            logger.debug('subscriptiondownload', 'not article found with link: ' + item.getLink() + ' inserting');
                            
                            articles.insert(article, {w:1}, function (err, doc) {
                                if (err) throw err; 
                				
                                articlesInserted++;
                            });
                        }
                    });
                });
                                                
                subscriptions.update({ _id : subscription._id }, { $set : { etag : etag, lastModified : lastModified }, $inc : { unread: articlesInserted } }, {w:1}, function (err, results) {
                    if (err) {
                        logger.error('subscriptiondownload', err, 'raised updating subscription details');
                        return;
                    }
                                        
                });
            });
        
        });
    });
};

execute();
