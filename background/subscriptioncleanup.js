var config = require('../config')
    , mongodb = require('mongodb')
    , ObjectID = require('mongodb').ObjectID
    , dbServer = new mongodb.Server(config.db.host, config.db.port)
    , db = new mongodb.Db('pushfeed', dbServer,{w:0})
    , moment = require('moment')
    , Q = require('q')
    , subscriptions = db.collection('subscriptions')
    , logger = require('../logger');
    
var execute = function() {
    Q.ninvoke(db, 'open')
    .then(function () {
        var   profiles = db.collection('profiles', {w:1})
            , subscriptions = db.collection('subscriptions', {w:1})
            , articles = db.collection('articles', {w:1});
    
        return Q.ninvoke(profiles, 'findOne', { _id: new ObjectID(config.profiles.id) }, { settings : 1})
                .then(function (profile) {
                    return Q.ninvoke(subscriptions, 'find', { profile : profile._id })
                            .then(function (cursor) { return Q.ninvoke(cursor, 'toArray'); })
                            .then(function (subscriptions) {
                                var deferreds = [];
                                subscriptions.forEach(function(subscription) {
                                    var deferred = Q.defer();
                                    deferreds.push(deferred.promise);
                                    
                                    var   unreadCutOff = moment().subtract('days', profile.settings.unreadCutOffDays).toDate()
                                        , readCutOff = moment().subtract('days', profile.settings.readCutOffDays).toDate()
                                        , unreadRemoval = Q.ninvoke(articles, 'remove', {subscription : subscription._id, read: false, published : { $lt: unreadCutOff } }, {w:1})
                                        , readRemoval = Q.ninvoke(articles, 'remove', {subscription : subscription._id, read: true, published : { $lt: readCutOff } }, {w:1});
                                        
                                    Q.all([unreadRemoval, readRemoval]).then(function() { deferred.resolve(); });
                                });
                                
                                return Q.all(deferreds);
                            });
                });
    })    
    .fin(function () { db.close(); })
    .done();
};

execute();
