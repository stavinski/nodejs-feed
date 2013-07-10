var config = require('../config')
    , engine = require('tingodb')()
    , db = new engine.Db( config.db.path , {})    
    , subscriptions = db.collection('subscriptions');

exports.getSubscriptions = function(req, res){
    subscriptions.find({ profile: config.profiles.id }).toArray(function (err, subscriptions) {
        if (err) throw err;
                
        res.json(subscriptions);
        res.end();
    });
};

exports.getSubscription = function(req, res) {
    var id = req.params.id;
    subscriptions.findOne({ _id : id }, function (err, subscription) {
        if (err) throw err;
        
        res.json(subscription);
        res.end();
    });
    
};