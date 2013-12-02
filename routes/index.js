/* jshint node: true */
'use strict';

var   array = require('array-extended')
    , fs = require('fs')
    , Q = require('q')
    , subscriptions = require('../data/subscriptions')
    , profiles = require('../data/profiles')
    , feed = require('../feed')
    , feedpush = require('../feedpush')
    , articles = require('../data/articles')
    , opml = require('../opml');

exports.index = function(req, res){
    var params = {
        title : 'pushfeed'
    };
    params.signedIn = (typeof req.user !== 'undefined');
    res.render('index', params);
};

exports.fail = function (req, res) {
    res.render('fail', { title : 'pushfeed' });
};

// exports subscriptions as an opml attachment
exports.export = function (req, res) {
    if (!req.user) {
        res.send(403);
        return;
    }
    
    subscriptions.getAllByProfile(req.user._id, new Date(0))
        .then(function (subscriptions) {
            var allCategories = subscriptions.map(function (subscription) {
                return subscription.category; 
            });
            
            var data = {
                categories : array(allCategories).unique(),
                subscriptions : subscriptions
            };
            
            var xml = opml.write(data);
            res.type('text/xml');
            res.header('Content-Disposition', 'attachment; filename=pushfeed.opml');
            res.send(xml);
        })
        .fail(function (err) { 
            console.error(err);
            res.send(500); 
        })
        .done();
};

// allows subscription using a bookmarklet
exports.subscribe = function (req, res) {
    if (!req.user) {
        res.send(403);
        return;
    }
    
    var url = req.params.url;
    console.log(req.params);
    if (url.length <= 0) {
        res.send(500);
        return;
    }
        
    feed.details(url)
        .then(function (details) {
            return subscriptions.upsert(details)
                .then(function (result) {
                    var subscription = result.subscription;
                    profiles.subscribe(req.user._id, subscription, {});    
                    
                    if (result.existing) 
                        return subscription;
                                                    
                    if ((subscription.pubsub !== null) && (subscription.pubsub.type == 'hub'))
                        feedpush.subscribe(subscription);
                                                    
                    return feed.articles(url)
                            .then(function (downloaded) {
                                return articles.upsert(subscription, downloaded);
                            })
                            .then(function () {
                                return subscription; 
                            });
                });
        })
        .then(function (subscription) { 
            res.send(200, 'subscription successful');
        })
        .fail(function (err) {
            console.error(err);
            res.send(500);
        })
        .done();    
};

exports.import = function (req, res) {
    var uploadedFile = req.files.importfile;
    
    if (!uploadedFile) {
        res.send({ status : 'error', reason: 'file has not been uploaded' });    
        return;
    }
    if (uploadedFile.type != 'text/xml') {
        res.send({ status : 'error', reason: 'file is not a valid opml xml file' });
        return;
    }
    
    Q.ninvoke(fs, 'readFile', uploadedFile.path, { encoding : 'utf-8' })
        .then(function (data) {
            return Q.ninvoke(opml, 'parse', data);
        })
        .then(function (feeds) {
            res.send({ status : 'success', feeds : feeds });
        })
        .fail(function (err) {
            console.error(err);
            res.send({ status : 'error', reason : 'could parse uploaded file' }); 
        });
};