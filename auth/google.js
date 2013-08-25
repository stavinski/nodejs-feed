var   config = require('../config')
    , passport = require('passport')
    , GoogleStrategy = require('passport-google').Strategy
    , mongodb = require('mongodb')
    , ObjectID = require('mongodb').ObjectID
    , dbServer = new mongodb.Server(config.db.host, config.db.port)
    , db = new mongodb.Db('pushfeed', dbServer, {w:0})
    , Q = require('q');

var initialize = function (app) {
    passport.use(new GoogleStrategy({
            returnURL: config.app.baseUrl + 'auth/google/return',
            realm: config.app.baseUrl,
            profile : false
        }, function(identifier, profile, done) {
            var profiles = db.collection('profiles');            
            Q.ninvoke(db, 'open')
                .then(function() {
                    return Q.ninvoke(profiles, 'findOne', { openid : identifier })
                            .then(function (profile) {
                            if (profile == null) {
                                return done(null, false);
                            }
                            
                            return done(null, profile);
                    })
                    .fail(function (err) { done(err, null); })
                })
                .fin(function () { db.close(); })
                .done();
        })
    );
    
    app.get('/auth/google', passport.authenticate('google', { failureRedirect: '/fail' }),
        function(req, res) {
            res.redirect('/');
    });
    
    app.get('/auth/google/return', passport.authenticate('google', { failureRedirect: '/fail' }),
        function(req, res) {
            res.redirect('/');
    });
};

module.exports.initialize = initialize;