var config = require('../config')
    , engine = require('tingodb')()
    , db = new engine.Db( config.db.path , {})
    , Q = require('q')
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

    console.log(filter);    
        
    var fetchFromCursor = function (cursor) {
        return Q.nbind(cursor.toArray, cursor)();
    };
    
    var flattenArticles = function (articles) {
        var flattened = [];
        return flattened.concat.apply(flattened, articles);
    };
           
    Q.nbind(subscriptions.find, subscriptions)(filter)
        .then(fetchFromCursor)
        .then(function (subs) { 
            var deferreds = [];
                        
            subs.forEach(function (sub) {
                var deferred = Q.defer();
                Q.nbind(articles.find, articles)({ subscription : sub._id}, {content:0})
                    .then(fetchFromCursor)
                    .then(deferred.resolve)
                    .then(deferreds.push(deferred.promise));
            }); 

            return Q.all(deferreds);
        })
        .then(flattenArticles)
        .then(function (results) { res.json(results); })
        .done();
        
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
   

    