/* jshint node: true */
'use strict';

var   providers = ['google', 'twitter', 'yahoo', 'facebook']
    , config = require('../config')
    , passport = require('passport')
    , express = require('express')
    , passport = require('passport')
    , express = require('express')
    , passportSIO = require('passport.socketio')
    , mongodb = require('mongoskin')
    , ObjectID = require('mongodb').ObjectID
    , db = new mongodb.db(config.db.url + 'pushfeed', {safe : true})
    , Q = require('q');

var init = function (app, io, sessionStore) {
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

    // handle sign out
    app.get('/signout', function (req, res) {
        req.logout();
        res.clearCookie(config.session.key, { path: '/' });
        res.render('signedout');
    });
    
    // initialize each provider
    providers.forEach(function (key) {
        var provider = require('./' + key);
        provider.initialize(app);
    });
    
};

module.exports.init = init;
    