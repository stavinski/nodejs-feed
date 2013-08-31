var config = require('../config')
    , mongodb = require('mongodb')
    , ObjectID = require('mongodb').ObjectID
    , dbServer = new mongodb.Server(config.db.host, config.db.port)
    , db = new mongodb.Db('pushfeed', dbServer,{w:0})
    , Q = require('q');

exports.getAll = function(userId, since) {
    return Q.ninvoke(db, 'open')
            .then(function (db) {
                return db.collection('subscriptions');
            })
            .then(function (subscriptions) {
                var cursor = subscriptions.find({ profile: new ObjectID(userId), created : { $gte : new Date(since) } }, { sort : [['title', 1]] });
                return Q.ninvoke(cursor, 'toArray');
            })
            .fin(function () { db.close(); });
};

exports.get = function(id) {
    return Q.ninvoke(db, 'open')
        .then(function (db) {
            var subscriptions = db.collection('subscriptions');
            return Q.ninvoke(subscriptions, 'findOne', { _id : new ObjectID(id) });
        })
        .fin(function () { db.close(); });
};