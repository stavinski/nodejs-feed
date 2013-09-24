var config = require('../config')
    , mongodb = require('mongoskin')
    , ObjectID = require('mongodb').ObjectID
    , db = new mongodb.db(config.db.url + 'pushfeed', {safe : true})
    , Q = require('q');

var unreadSubscriptionMap = function () {
    emit(this.subscription, 1);  
};

var unreadSubscriptionReduce = function(key, vals) {
    return { subscription : key, count : vals.length };
};

exports.getForProfile = function (profile) {
    return Q.ninvoke(db, 'open')
            .then(function () {
                return Q.ninvoke(db.collection('profiles'), 'findOne', { _id : new ObjectID(profile) }, { _id : 0, subscriptions : 1 })
                        .then(function (result) { return result.subscriptions; });
            })
            .then(function (subscriptions) {
                var  filter = {
                    subscription : { $in : subscriptions },
                    read : { $ne : new ObjectID(profile) },
                    starred : { $ne : new ObjectID(profile) }
                };
                return Q.ninvoke(db.collection('articles'), 'mapReduce', unreadSubscriptionMap, unreadSubscriptionReduce, { query : filter, out : { inline : true } });
            })
            .then(function (results) {
                var groups = results[0];
                return groups.map(function (group) {
                    return group.value;    
                });
            })
            .fin(function () { db.close(); });
};