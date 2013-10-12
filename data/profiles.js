var config = require('../config')
    , mongodb = require('mongoskin')
    , ObjectID = require('mongodb').ObjectID
    , db = new mongodb.db(config.db.url + 'pushfeed', {safe : true})
    , Q = require('q');

exports.find = function (openid) {
    return Q.ninvoke(db, 'open')
        .then(function (db) {
            return Q.ninvoke(db.collection('profiles'), 'findOne', { openid : openid }, { created : 1, settings : 1, categories: 1 }, {w:1});
        })
        .fin(function () { db.close(); });
};

exports.insert = function (openid) {
    return Q.ninvoke(db, 'open')
        .then(function (db) {
            var data =  {
                connected : false,
                created : new Date(),
                openid : openid,
                settings : {
                    articleDetailsCache : 5
                },
                socketId : '',
                subscriptions : []
            };
            return Q.ninvoke(db.collection('profiles'), 'insert', data, {w:1});
        })
        .then (function () {
            return Q.ninvoke(db.collection('profiles'), 'findOne', { openid : openid }, { created : 1, settings : 1, subscriptions: 1 }, {w:1});       
        })
        .fin(function () { db.close(); });
};

exports.connected = function (profile, socketId) {
    return Q.ninvoke(db, 'open')
            .then(function (db) {
                return Q.ninvoke(db.collection('profiles'), 'update', { _id : new ObjectID(profile) }, { $addToSet : { connections : socketId } });
            })
            .fin(function () { db.close(); });
};

exports.disconnected = function (profile, socketId) {
    return Q.ninvoke(db, 'open')
            .then(function (db) {
                var profiles = db.collection('profiles');
                return Q.ninvoke(profiles, 'update', { _id : new ObjectID(profile) }, { $pull : { connections : String(socketId) } });
            })
            .fin(function () { db.close(); });
};

exports.getAllConnected = function (subscription) {
    return Q.ninvoke(db, 'open')
            .then(function (db) {
                var cursor = db.collection('profiles').find({ connections : { $not : { $size : 0 } }, 'subscriptions._id' : subscription });
                return Q.ninvoke(cursor, 'toArray');
            })
            .fin(function () { db.close(); });
};
    
exports.subscribe = function (profile, subscription) {
    return Q.ninvoke(db, 'open')
            .then(function () {
                var   title = subscription.title
                    , stitle = title.toLowerCase()
                    , category = subscription.category || 'main'
                    , data = {
                        $push : {
                                subscriptions : {
                                    _id : subscription._id,
                                    title : title,
                                    stitle : stitle,
                                    subscribed : new Date(),
                                    category : category   
                                }                    
                        }
                    };
                
                return Q.ninvoke(db.collection('profiles'), 'update', { _id : new ObjectID(profile) },  data);
            })
            .fin(function () { db.close(); });
};

exports.unsubscribe = function (profile, subscription) {
    return Q.ninvoke(db, 'open')
            .then(function (db) {
                var profiles = db.collection('profiles');
                return Q.ninvoke(profiles, 'update', { _id : new ObjectID(profile) }, { $pull : { subscriptions : { _id : new ObjectID(subscription) } } });
            })
            .fin(function () { db.close(); });
};

exports.subscriptionUpdate = function (profile, meta) {
    return Q.ninvoke(db, 'open')
            .then(function () {
                var update = { $set : {} };
                if (meta.category)
                    update.$set['subscriptions.$.category'] = meta.category;
                                
                return Q.ninvoke(db.collection('profiles'), 'update', { _id : new ObjectID(profile), 'subscriptions._id' : new ObjectID(meta.subscription) }, update, {w:1});
            })
            .fin(function () { db.close(); })
};


