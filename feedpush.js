var   config = require('./config')
    , Q = require('q')
    , uuid = require('uuid')
    , subscriptions = require('./data/subscriptions')
    , articles = require('./data/articles')
    , feed = require('./feed')
    , request = require('request')
    , verifyTokens = {};

var handleSubscriptionVerification = function (req, res, subscription) {
    
    if (req.method.toLowerCase() == 'get') {
        var   mode = req.query['hub.mode']
            , topic = req.query['hub.topic']
            , challenge = req.query['hub.challenge']
            , verifyToken = req.query['hub.verify_token']
            , leaseSeconds = req.query['hub.lease_seconds'] || 24 * 60 * 60; // if not provided default to a day
        
        if ((!mode) || (!topic) || (!challenge))
            throw new Error('missing required parameters');
        
        if (subscription.xmlurl.toLowerCase() != topic.toLowerCase())
            throw new Error('topic does not match the subscription');
        
        if (verifyTokens[subscription._id] != verifyToken)
            throw new Error('incorrect verify token supplied');
        
        var   now = new Date()
            , expires = new Date(now.setSeconds(now.getSeconds() + leaseSeconds));
        
        if (mode == 'subscribe') {
            subscriptions.subscribe(subscription, expires)
                .then(function () {
                    res.send(200, challenge);        
                });
        } else if (mode == 'unsubscribe') {
            subscriptions.unsubscribe(subscription)
                .then(function () {
                    res.send(200, challenge);        
                });    
        }
    }    
};

var handleSubscriptionContent = function (req, res, subscription) {
    if (req.method.toLowerCase() == 'post') {
        feed.parse(req.body)
            .then(function (articles) {
                return articles.upsert(subscription, articles);
            })
            .then(function () {
                res.send(200);
            });
    }
};

var subscriptionRequest = function (subscription, subscribe) {
    if (subscription.pubsub == null)
            throw new Error('not a pubsub subscription');
        
    var pubsub = subscription.pubsub;
    if (pubsub.type != 'hub')
        throw new Error('not a pubsub subscription');
    
    var   opts = {
            form : {
                'hub.callback' : config.app.baseUrl + 'push/?subscription=' + subscription._id,
                'hub.mode' : (subscribe) ? 'subscribe' : 'unsubscribe',
                'hub.topic' : subscription.xmlurl,
                'hub.verify' : 'sync',
                'hub.verify_token' : verifyTokens[subscription._id] = uuid.v4(),
                'hub.lease_seconds' : config.feedpush.leaseSeconds
            }
          }
        , deferred = Q.defer();
    
    request.post(pubsub.href, opts, function (err, response, body) {
        if (err) {
            deferred.reject(err);
            return;
        }
                    
        if (response.statusCode[0] != 2) {
            deferred.reject(new Error('hub responded with status: [' + response.statusCode + ']'));
            return;
        }
                            
        deferred.resolve();                                
    });
    
    return deferred.promise;
};

var feedpush = {
    handler : function () {
        return function (req, res, next) {
            var id = req.query.subscription;
            
            if (!id) {
                res.send(404);
                return;
            }
            
            subscriptions.get(id)
                .then(function (subscription) {
                    if (subscription == null) {
                        res.send(404);
                        return;
                    }
                    
                    handleSubscriptionVerification(req, res, subscription);
                    handleSubscriptionContent(req, res, subscription);                    
                })
                .fail(function (err) { console.log(err); res.send(500); })
                .fin(function () { next(); })
                .done();
        };
    },
    subscribe : function (subscription) { 
        subscriptionRequest(subscription, true);
    },
    unsubscribe : function (subscription) 
    {  
        subscriptionRequest(subscription, false);
    }
};

module.exports = feedpush;