var config = require('../config')
    , engine = require('tingodb')()
    , db = new engine.Db( config.db.path , {})
    , logger = require('../logger')
    , subscriptions = db.collection('subscriptions')
    , articles = db.collection('articles');

exports.getArticles = function(req, res) {
    var filter = {
        profile: config.profiles.id
    };
    
    if (req.query.unread)
        filter.read = false;
        
    if (req.query.starred)
        filter.starred = true;
        
    subscriptions.find(filter).toArray(function (err, subscriptions) {
        if (err) {
            logger.error('articlesapi', 'raised when finding subscriptions', err);
            return;
        }
    
        subscriptions.forEach(function (subscription) {
            articles.find({ subscription: subscription._id }, {content: 0}, {w:1}).toArray(function (err, articles) {
                if (err) {
                    logger.error('articlesapi', 'raised when finding articles', err);
                    return;
                }
                
                res.json(articles);
            });
        });  
    });
};

exports.getArticle = function(req, res) {
    var id = req.params.id;
    articles.findOne({_id : id}, function(err, article) {
        if (err) {
            logger.error('articlesapi', 'raised when finding individual article', err);
            return;
        }
        
        res.json(article);
    });
};

exports.read = function (req, res) {
    var   subscriptionId = req.params.subscriptionid
        , articleIndex = req.params.articleindex;
        
    subscriptions.findOne({ _id: subscriptionId }, function (err, subscription) {
        if (err) {
            logger.error('articlesapi', 'raised when setting article to read', err);
            return;
        }
        
        if (!subscription) {
            res.json({ status : 'failed', reason : 'could not find subscription' });
            return;
        }
        
        subscription.unread--;
        var article = subscription.articles[articleIndex];
        if (article) {
            article.read = true;
        }
        
        console.log(subscription);
                
        subscriptions.save(subscription, function (err) {
            if (err) {
                logger.error('articlesapi', 'raised when saving subscription', err);
                return;
            }
           
            res.json({ status : 'success' });
        });
    });
};
   

    