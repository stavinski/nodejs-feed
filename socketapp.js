var   config = require('./config')
    , subscriptions = require('./data/subscriptions')
    , subscriptioninstances = require('./data/subscriptioninstances')
    , articles = require('./data/articles')
    , user = null;

var assignUser = function (socket) {
    user = socket.handshake.user;
};
    
var syncSubscriptions = function (socket) {
    socket.on('backend.syncsubscriptions', function (data) {
        subscriptions.getAll(user._id, data.since)
            .then(function (subscriptions) {
                socket.emit('backend.subscriptions', { timestamp : new Date(), subscriptions : subscriptions });
            })
            .done();
    });
};    

var syncArticles = function (socket) {
    socket.on('backend.syncarticles', function (data) {
        articles.getAll(user._id, data.filter, data.since)
            .then(function (articles) {
                socket.emit('backend.articles', { timestamp: new Date(), filter : data.filter, articles : articles });
            })
            .done();
    });
};

var syncProfile = function (socket) {
    socket.on('backend.syncprofile', function () {
        var profile = {
            created : user.created,
            settings : user.settings
        };
        socket.emit('backend.profile', { timestamp : new Date(), profile : profile });
    });
};

var syncArticle = function (socket) {
    socket.on('backend.syncarticle', function (data, callback) {
        articles.get(data.id)
            .then(function (article) {
                callback({ timestamp: new Date(), article : article });
            })
            .done();
    });
};
    
var start = function (sio) {
    
    // configure socket.io
    sio.set('log level', config.socketio.loglevel);
    if (config.socketio.minify) sio.enable('browser client minification');
    
    // main entry point
    sio.sockets.on('connection', function (socket) {
       assignUser(socket);
       syncSubscriptions(socket);
       syncArticles(socket);
       syncProfile(socket);
       syncArticle(socket);
       
       socket.on('backend.addfeed', function (data, callback) {
            var   feed = require('./feed')
                , feedpush = require('./feedpush');
            
            feed.details(data.url)
                    .then(function (details) {
                        subscriptions.getByUrl(details.xmlurl)
                            .then(function (subscription) { 
                                if (subscription == null) {
                                    return subscriptions.insert(details);
                                } else {
                                    return subscription;
                                }                                 
                            })
                            .then (function (subscription) {
                                console.log('subscribing ' + subscription);
                                if (subscription.pubsub != null) {
                                    feedpush.subscribe(subscription.pubsub.href, subscription.xmlurl);
                                }
                                
                                return subscription;
                            })
                            .then (function (subscription) {
                                // insert articles
                                
                                return subscription;
                            })
                            .then (function (subscription) {
                                console.log('instance ' + subscription);
                                subscriptioninstances.insert(subscription, user._id);
                            })
                            .done();
                            
                        callback({ status : 'success' });
                    })
                    .fail(function (err) {
                        callback({ status : 'error' });
                    })
                    .done();
       });
       
       
    });
    
};

module.exports.start = start;