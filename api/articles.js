var config = require('../config')
    , engine = require('tingodb')()
    , db = new engine.Db( config.db.path , {})
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
        if (err) throw err;
    
        subscriptions.forEach(function (subscription) {
            articles.find({ subscription: subscription._id }, {content: 0}).toArray(function (err, articles) {
                if (err) throw err;
                
                res.json(articles);
            });
        });  
        
        res.end();
    });
};

exports.getArticle = function(req, res) {
    var id = req.params.id;
    articles.findOne({_id : id}, function(err, article) {
        if (err) throw err;
        
        res.json(article);
    });
};

exports.read = function (req, res) {
    var   subscriptionId = req.params.subscriptionid
        , articleIndex = req.params.articleindex;
        
    subscriptions.findOne({ _id: subscriptionId }, function (err, subscription) {
        if (err) throw err;
        
        if (!subscription) {
            res.json({ status : 'failed', reason : 'could not find subscription' });
            res.end();
            return;
        }
        
        var article = subscription.articles[articleIndex];
        if (article) {
            article.read = true;
        }
        
        console.log(subscription);
                
        subscriptions.save(subscription, function (err) {
            if (err) throw err;
           
            res.json({ status : 'success' });
            res.end();
        });
    });
};
   

    