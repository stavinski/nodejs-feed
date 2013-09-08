var config = require('../config')
    , mongodb = require('mongodb')
    , mongoskin = require('mongoskin')
    , ObjectID = require('mongodb').ObjectID
    , dbServer = new mongodb.Server(config.db.host, config.db.port)
    , skinServer = new mongoskin.SkinServer(dbServer)
    , db = skinServer.db('pushfeed', {w:0})
    , Q = require('q');


exports.insert = function (subscription, profile) {
    return Q.ninvoke(db, 'open')
               .then(function (db) {
                    var   subscriptioninstances = db.collection('subscriptioninstances')
                        , data = {
                                    profile : profile,
                                    subscription : subscription._id,
                                    title : subscription.title,
                                    subscribedAt : new Date()
                                 };
                    
                    return Q.ninvoke(subscriptioninstances, 'insert', data, {w:1});
               })
               .then(function (count) { return count > 0; })
               .fin(function () { db.close(); });
};