var config = require('../config')
    , mongodb = require('mongodb')
    , ObjectID = require('mongodb').ObjectID
    , dbServer = new mongodb.Server(config.db.host, config.db.port)
    , db = new mongodb.Db('pushfeed', dbServer,{w:0})
    , Q = require('q');

exports.getSubscriptions = function(req, res){
    Q.ninvoke(db, 'open')
        .then(function (db) {
            return db.collection('subscriptions');
        })
        .then(function (subscriptions) {
            var cursor = subscriptions.find({ profile: new ObjectID(config.profiles.id) }, { sort : [['title', 1]] });
            return Q.ninvoke(cursor, 'toArray');
        })
        .then(function (subscriptions) {
            res.json(subscriptions);
        })
        .fin(function () { db.close(); })
        .done();
};

exports.getSubscription = function(req, res) {
    var id = req.params.id;
    Q.ninvoke(db, 'open')
        .then(function (db) {
            var subscriptions = db.collection('subscriptions');
            return Q.ninvoke(subscriptions, 'findOne', { _id : new ObjectID(id) });
        })
        .then(function (subscription) {
            res.json(subscription);
        })
        .fin(function () { db.close(); })
        .done();
};