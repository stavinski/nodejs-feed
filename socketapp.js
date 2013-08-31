var   config = require('./config')
    , subscriptions = require('./data/subscriptions')
    , articles = require('./data/articles')
    , articlesHandler = require('./handlers/articlesupdated')
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
       
       articlesHandler.init(socket, user);
    });
    
};

module.exports.start = start;