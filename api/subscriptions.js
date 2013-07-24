var config = require('../config')
    , engine = require('tingodb')()
    , db = new engine.Db( config.db.path , {})    
    , Q = require('q');

exports.getSubscriptions = function(req, res){
    Q.ninvoke(db, 'open')
        .then(function (db) {
            return db.collection('subscriptions');
        })
        .then(function (subscriptions) {
            var cursor = subscriptions.find({ profile: config.profiles.id });
            return Q.ninvoke(cursor, 'toArray');
        })
        .then(function (subscriptions) {
            res.json(subscriptions);
        })
        .done();
};

exports.getSubscription = function(req, res) {
    var id = req.params.id;
    Q.ninvoke(db, 'open')
        .then(function (db) {
            var subscriptions = db.collection('subscriptions');
            return Q.ninvoke(subscriptions, 'findOne', { _id : id });
        })
        .then(function (subscription) {
            res.json(subscription);
        })
        .done();
};