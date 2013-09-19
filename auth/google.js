var   config = require('../config')
    , profiles = require('../data/profiles')
    , passport = require('passport')
    , GoogleStrategy = require('passport-google').Strategy
    , mongodb = require('mongoskin')
    , ObjectID = require('mongodb').ObjectID
    , db = new mongodb.db(config.db.url + 'pushfeed', {safe : true})
    , Q = require('q');

var initialize = function (app) {
    passport.use(new GoogleStrategy({
            returnURL: config.app.baseUrl + 'auth/google/return',
            realm: config.app.baseUrl,
            profile : false
        }, function(identifier, profile, done) {
            profiles.find(identifier)
                .then (function (profile) {
                    if (profile == null) {
                        profiles.insert(identifier)
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
    
    app.get('/auth/google', passport.authenticate('google', { failureRedirect: '/fail' }),
        function(req, res) {
            res.redirect('/');
    });
    
    app.get('/auth/google/return', passport.authenticate('google', { failureRedirect: '/fail' }),
        function(req, res) {
            if (req.user.new)
                res.redirect('/#/welcome');
            else
                res.redirect('/#/');
    });
        
};

module.exports.initialize = initialize;