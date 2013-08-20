var   config = require('./config')
    , passport = require('passport')
    , express = require('express')
    , GoogleStrategy = require('passport-google').Strategy
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
    
    // google
    passport.use(new GoogleStrategy({
            returnURL: 'http://pushfeed.local:3000/auth/google/return',
            realm: 'http://pushfeed.local:3000/',
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
    
    // google end
    
    // socket io auth
    io.set("authorization", passportSIO.authorize({
        cookieParser: express.cookieParser, 
        key:          config.session.key,        
        secret:       config.session.secret,  
        store:        sessionStore,      
        fail: function(data, accept) {
            accept(null, false);
        },
        success: function(data, accept) {
            console.log(data);
            accept(null, true);
        }
    }));

};

module.exports.initialize = initialize;
    