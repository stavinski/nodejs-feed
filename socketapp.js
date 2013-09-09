var   config = require('./config')
    , subscriptions = require('./data/subscriptions')
    , profile = require('./data/profile')
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
        articles.getUnread(user._id, data.since)
            .then(function (articles) {
                socket.emit('backend.articles', { timestamp: new Date(), articles : articles });
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
                articles.read(user._id, article);
            })
            .done();
    });
};

var handleStarred = function (socket) {
    socket.on('backend.starred', function (data, callback) {
        articles.starred(user._id, data.id)
            .then(function () {
                callback({ timestamp: new Date(), status : 'success' });
            })
            .fail(function () {
                callback({ timestamp: new Date(), status : 'error' });
            })
            .done();
    });
};

var handleUnstarred = function (socket) {
    socket.on('backend.unstarred', function (data, callback) {
        articles.unstarred(user._id, data.id)
            .then(function () {
                callback({ timestamp: new Date(), status : 'success' });
            })
            .fail(function () {
                callback({ timestamp: new Date(), status : 'error' });
            })
            .done();
    });
};

var handleAddFeed = function (socket) {
    socket.on('backend.addfeed', function (data, callback) {
            var   feed = require('./feed')
                , feedpush = require('./feedpush');
            
            feed.details(data.url)
                    .then(function (details) {
                        subscriptions.upsert(details)
                            .then(function (updated) { 
                                if (updated.length == 0) return;
                                    
                                var subscription = updated[0];
                                profile.subscribe(user._id, subscription);    
                                
                                if (subscription.pubsub != null)
                                    feedpush.subscribe(subscription.pubsub.href, subscription.xmlurl);
                                                                
                                return feed.articles(data.url)
                                        .then(function (downloaded) {
                                            articles.upsert(subscription, downloaded);
                                        });
                            })
                    })
                    .then(function () { callback({ status : 'success' }); })
                    .fail(function (err) {
                        console.error(err);
                        callback({ status : 'error' });
                    })
                    .done();
       });
};

var handleUserConnected = function (socket) {
    profile.connected(user._id);
};

var handleUserDisconnected = function (socket) {
    socket.on('disconnect', function () {
        profile.disconnected(user._id);
    });
};
    
var start = function (sio) {
    
    // configure socket.io
    sio.set('log level', config.socketio.loglevel);
    if (config.socketio.minify) sio.enable('browser client minification');
    
    // main entry point
    sio.sockets.on('connection', function (socket) {
       assignUser(socket);
       handleUserConnected(socket);
       syncSubscriptions(socket);
       syncArticles(socket);
       syncProfile(socket);
       syncArticle(socket);
       handleAddFeed(socket);
       handleStarred(socket);       
       handleUnstarred(socket);       
       handleUserDisconnected(socket);       
    });
    
};

module.exports.start = start;