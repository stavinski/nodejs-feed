var   config = require('../config')
    , profiles = require('../data/profiles')
    , passport = require('passport')
    , FacebookStrategy = require('passport-facebook').Strategy
    , mongodb = require('mongoskin')
    , ObjectID = require('mongodb').ObjectID
    , db = new mongodb.db(config.db.url + 'pushfeed', {safe : true})
    , Q = require('q');

var initialize = function (app) {
    passport.use(new FacebookStrategy({
            callbackURL: config.app.baseUrl + 'auth/facebook/return',
            clientID : config.auth.facebook.appID,
            clientSecret : config.auth.facebook.appSecret,
            profileFields : ['id']
        }, function(accessToken, refreshToken, profile, done) {
            profiles.find(profile.id)
                .then (function (found) {
                    if (found == null) {
                        profiles.insert(profile.id)
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
    
    app.get('/auth/facebook', passport.authenticate('facebook', { failureRedirect: '/fail' }),
        function(req, res) {
            res.redirect('/');
    });
    
    app.get('/auth/facebook/return', passport.authenticate('facebook', { failureRedirect: '/fail' }),
        function(req, res) {
            if (req.user.new)
                res.redirect('/#welcome');
            else
                res.redirect('/');
    });
        
};

module.exports.initialize = initialize;