var config = require('./config')
    , engine = require('tingodb')()
    , db = new engine.Db( config.db.path , {})    
    , subscriptions = db.collection('subscriptions');

exports.subscriptions = function(req, res){
    subscriptions.find({ profile: config.profiles.id }).toArray(function (err, subscriptions) {
        if (err) throw err;
                
        res.json(subscriptions);
        res.end();
    });
};

exports.articleRead = function (req, res) {
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
   

    