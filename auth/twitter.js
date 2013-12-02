/* jshint node: true */
'use strict';

var   config = require('../config')
    , profiles = require('../data/profiles')
    , passport = require('passport')
    , TwitterStrategy = require('passport-twitter').Strategy
    , mongodb = require('mongoskin')
    , ObjectID = require('mongodb').ObjectID
    , db = new mongodb.db(config.db.url + 'pushfeed', {safe : true})
    , Q = require('q');

var initialize = function (app) {
    passport.use(new TwitterStrategy({
            consumerKey : config.auth.twitter.consumerKey,
            consumerSecret : config.auth.twitter.consumerSecret
        }, function(token, tokenSecret, profile, done) {
            profiles.find(profile.id)
                .then (function (found) {
                    if (found === null) {
                        profiles.insert(profile.id)
                            .then(function (profile) {
                                profile.new = true;
                                return done(null, profile);    
                            });
                    } else {
                        profile.new = false;
                        return done(null, profile);    
                    }                    
                })
                .fail(function (err) { done(err, null); })
                .done();
            })
    );
    
    app.get('/auth/twitter', passport.authenticate('twitter', { failureRedirect: '/fail' }),
        function(req, res) {
            res.redirect('/');
    });
    
    app.get('/auth/twitter/return', passport.authenticate('twitter', { failureRedirect: '/fail' }),
        function(req, res) {
            if (req.user.new)
                res.redirect('/#/welcome');
            else
                res.redirect('/#/');
    });
        
};

module.exports.initialize = initialize;