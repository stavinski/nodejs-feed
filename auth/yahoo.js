/* jshint node: true */
'use strict';

var   config = require('../config')
    , profiles = require('../data/profiles')
    , passport = require('passport')
    , YahooStrategy = require('passport-yahoo').Strategy
    , mongodb = require('mongoskin')
    , ObjectID = require('mongodb').ObjectID
    , db = new mongodb.db(config.db.url + 'pushfeed', {safe : true})
    , Q = require('q');

var initialize = function (app) {
    passport.use(new YahooStrategy({
            returnURL: config.app.baseUrl + 'auth/yahoo/return',
            realm: config.app.baseUrl,
            profile: false
        }, function(identifier, profile, done) {
            profiles.find(identifier)
                .then (function (found) {
                    if (found === null) {
                        profiles.insert(identifier)
                            .then(function (inserted) {
                                inserted.new = true;
                                return done(null, inserted);    
                            });
                    } else {
                        found.new = false;
                        return done(null, found);    
                    }                    
                })
                .fail(function (err) { done(err, null); })
                .done();
            })
    );
    
    app.get('/auth/yahoo', passport.authenticate('yahoo', { failureRedirect: '/fail' }),
        function(req, res) {
            res.redirect('/');
    });
    
    app.get('/auth/yahoo/return', passport.authenticate('yahoo', { failureRedirect: '/fail' }),
        function(req, res) {
            if (req.user.new)
                res.redirect('/#/welcome');
            else
                res.redirect('/#/');
    });
        
};

module.exports.initialize = initialize;