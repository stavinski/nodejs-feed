var   config = require('./config')
    , subscriptions = require('./data/subscriptions')
    , articles = require('./data/articles');

var syncSubscriptions = function (socket) {
    socket.on('backend.syncsubscriptions', function () {
        subscriptions.getAll()
            .then(function (subscriptions) {
                socket.emit('backend.subscriptions', subscriptions);
            })
            .done();
    });
};    

var syncArticles = function (socket) {
    socket.on('backend.syncarticles', function (data) {
        articles.getAll(data.filter)
            .then(function (articles) {
                socket.emit('backend.articles', articles);
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
       syncSubscriptions(socket);
       syncArticles(socket);
    });
    
};

module.exports.start = start;