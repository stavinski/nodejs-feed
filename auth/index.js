
var   providers = ['google']
    , config = require('../config')
    , passport = require('passport')
    , express = require('express')
    , passport = require('passport')
    , express = require('express')
    , passportSIO = require('passport.socketio')
    , mongodb = require('mongodb')
    , ObjectID = require('mongodb').ObjectID
    , dbServer = new mongodb.Server(config.db.host, config.db.port)
    , db = new mongodb.Db('pushfeed', dbServer, {w:0})
    , Q = require('q');

var initialize = function (app, io, sessionStore) {
    passport.serializeUser(function(profile, done) {
        done(null, profile);
    });

    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });
    
    io.set("authorization", passportSIO.authorize({
        cookieParser: express.cookieParser, 
        key:          config.session.key,        
        secret:       config.session.secret,  
        store:        sessionStore,      
        fail: function(data, accept) {
            accept(null, false);
        },
        success: function(data, accept) {
            accept(null, true);
        }
    }));

    // initialize each provider
    providers.forEach(function (key) {
        var provider = require('./' + key);
        provider.initialize(app);
    });
    
};

module.exports.initialize = initialize;
    