var   config = require('./config')
    , subscriptions = require('./data/subscriptions')
    , profiles = require('./data/profiles')
    , articles = require('./data/articles')
    , summary = require('./data/summary')
    , bus = require('./bus')
    , auth = require('./auth')
    , user = null;

var assignUser = function (socket) {
    user = socket.handshake.user;
};

var syncSummary = function (socket) {
    socket.on('backend.syncsummary', function (data, callback) {
        summary.getForProfile(user._id)
            .then(function (result) {
                callback({ status : 'success', timestamp : new Date(), summary : result });
            })
            .fail(function (err) {
                callback({ status : 'error', timestamp : new Date() });    
            })
            .done();
    });
};

var syncSubscriptions = function (socket) {
    socket.on('backend.syncsubscriptions', function (data, callback) {
        subscriptions.getAllByProfile(user._id, data.since)
            .then(function (subscriptions) {
                callback({ status : 'success', timestamp : new Date(), subscriptions : subscriptions });
            })
            .fail(function (err) {
                callback({ status : 'error', timestamp : new Date() });    
            })
            .done();
    });
};    

var syncArticles = function (socket) {
    socket.on('backend.syncarticles', function (data, callback) {
        articles.getForProfile(user._id, data.since, data.subscription)
            .then(function (articles) {
                callback({ status : 'success', timestamp: new Date(), articles : articles });
            })
            .fail(function (err) {
                callback({ status : 'error', timestamp : new Date() });    
            })
            .done();
    });    
};

var syncProfile = function (socket) {
    socket.on('backend.syncprofile', function (data, callback) {
        var profile = {
            created : user.created,
            settings : user.settings
        };
        callback({ timestamp : new Date(), profile : profile });
    });
};

var syncArticle = function (socket) {
    socket.on('backend.syncarticle', function (data, callback) {
        articles.get(user._id, data.id)
            .then(function (article) {
                callback({ status : 'success', timestamp: new Date(), article : article });
                articles.read(user._id, article);
            })
            .fail(function (err) {
                callback({ status : 'error', timestamp : new Date() });    
            })
            .done();
    });
};

var handleStarred = function (socket) {
    socket.on('backend.articlestarred', function (data, callback) {
        articles.starred(user._id, data.id)
            .then(function () {
                callback({ status : 'success', timestamp: new Date() });
            })
            .fail(function () {
                callback({ status : 'error', timestamp: new Date() });
            })
            .done();
    });
};

var handleUnstarred = function (socket) {
    socket.on('backend.articleunstarred', function (data, callback) {
        articles.unstarred(user._id, data.id)
            .then(function () {
                callback({ status : 'success', timestamp: new Date() });
            })
            .fail(function () {
                callback({ status : 'error', timestamp: new Date() });
            })
            .done();
    });
};

var handleAddSubscription = function (socket) {
    socket.on('backend.addsubscription', function (data, callback) {
            var   feed = require('./feed')
                , feedpush = require('./feedpush');
            
            feed.details(data.url)
                    .then(function (details) {
                        return subscriptions.upsert(details)
                            .then(function (result) {
                                var subscription = result.subscription;
                                profiles.subscribe(user._id, subscription);    
                                
                                if (result.existing) 
                                    return subscription;
                                                                
                                if ((subscription.pubsub != null) && (subscription.pubsub.type == 'hub'))
                                    feedpush.subscribe(subscription);
                                                                
                                return feed.articles(data.url)
                                        .then(function (downloaded) {
                                            articles.upsert(subscription, downloaded);
                                        })
                                        .then(function () {
                                            return subscription; 
                                        });
                            });
                    })
                    .then(function (subscription) { callback({ status : 'success', timestamp : new Date(), subscription : subscription }); })
                    .fail(function (err) {
                        console.error(err);
                        callback({ status : 'error' });
                    })
                    .done();
       });
};

var handleUnsubscribe = function (socket) {
    socket.on('backend.unsubscribe', function (data, callback) {
        profiles.unsubscribe(user._id, data.id)
            .then(function () { return subscriptions.get(data.id); })
            .then(function (subscription) { callback({ status : 'success', timestamp : new Date(), subscription : subscription }); })
            .fail(function (err) {
                callback({ status : 'error', timestamp : new Date() });
            })
            .done();
    });
};

var handleUserConnected = function (socket) {
    profiles.connected(user._id, socket.id);
};

var handleUserDisconnected = function (socket) {
    socket.on('disconnect', function () {
        profiles.disconnected(user._id);
    });
};

var handleArticlesUpdated = function (sio) {
    bus.subscribe('bg.articlesupdated', function (msg) {
        profiles.getAllConnected(msg.subscription._id)
            .then(function (results) {
                results.forEach(function (found) {
                    var socket = sio.sockets.socket(found.socketId);
                    
                    // just in case the socket has closed between the retrieval
                    if (socket)                    
                        socket.emit('backend.articlesupdated', { timestamp: new Date() });    
                });                
            })
            .fail(function (err) {
                console.error(err);
            })
            .done();
    });
};
    
var start = function (sio) {
            
    // configure socket.io
    sio.set('log level', config.socketio.loglevel);
    if (config.socketio.minify) sio.enable('browser client minification');
    
    // handle when articles are updated in the background
    // will find a proper home going forward
    handleArticlesUpdated(sio);
    
    // main entry point
    sio.sockets.on('connection', function (socket) {
        assignUser(socket);
        handleUserConnected(socket);
        syncSummary(socket);
        syncSubscriptions(socket);
        syncArticles(socket);
        syncProfile(socket);
        syncArticle(socket);
        handleAddSubscription(socket);
        handleUnsubscribe(socket);
        handleStarred(socket);       
        handleUnstarred(socket);
        handleUserDisconnected(socket);       
    });
    
};

module.exports.start = start;