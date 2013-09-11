var config = require('../config')
    , mongodb = require('mongodb')
    , mongoskin = require('mongoskin')
    , ObjectID = require('mongodb').ObjectID
    , dbServer = new mongodb.Server(config.db.host, config.db.port)
    , skinServer = new mongoskin.SkinServer(dbServer)
    , db = skinServer.db('pushfeed', {w:0})
    , Q = require('q');

exports.connected = function (profile, socketId) {
    return Q.ninvoke(db, 'open')
            .then(function (db) {
                var profiles = db.collection('profiles');
                return Q.ninvoke(profiles, 'update', { _id : new ObjectID(profile) }, { $set : { connected : true, socketId : socketId } });
            })
            .fin(function () { db.close(); });
};

exports.disconnected = function (profile) {
    return Q.ninvoke(db, 'open')
            .then(function (db) {
                var profiles = db.collection('profiles');
                return Q.ninvoke(profiles, 'update', { _id : new ObjectID(profile) }, { $set : { connected : false } });
            })
            .fin(function () { db.close(); });
};

exports.getAllConnected = function (subscription) {
    return Q.ninvoke(db, 'open')
            .then(function (db) {
                var cursor = db.collection('profiles').find({ connected : true, subscriptions : subscription });
                return Q.ninvoke(cursor, 'toArray');
            })
            .fin(function () { db.close(); });
};
    
exports.subscribe = function (profile, subscription) {
    return Q.ninvoke(db, 'open')
            .then(function (db) {
                var profiles = db.collection('profiles');
                return Q.ninvoke(profiles, 'update', { _id : new ObjectID(profile) }, { $addToSet : { subscriptions : subscription._id } });
            })
            .fin(function () { db.close(); });
};

exports.unsubscribe = function (profile, subscription) {
    return Q.ninvoke(db, 'open')
            .then(function (db) {
                var profiles = db.collection('profiles');
                return Q.ninvoke(profiles, 'update', { _id : new ObjectID(profile) }, { $pull : { subscriptions : subscription._id } });
            })
            .fin(function () { db.close(); });
};