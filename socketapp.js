var   Q = require('Q')
    , config = require('./config')
    , subscriptions = require('./data/subscriptions')
    , articles = require('./data/articles');

var oncall = function (socket, event) {
    var deferred = Q.defer();
    socket.on(event, function(data) {
        deferred.resolve(data);
    });
        
    return deferred.promise;
};
    
var start = function (sio) {
    
    // configure socket.io
    sio.set('log level', config.socketio.loglevel);
    if (config.socketio.minify) sio.enable('browser client minification');
    
    // main entry point
    sio.sockets.on('connection', function (socket) {
       
       oncall(socket, 'backend.syncsubscriptions')
            .then(function () { return subscriptions.getAll(); })
            .then(function (subscriptions) { socket.emit('backend.subscriptions', subscriptions); })
            .done();
              
       oncall(socket, 'backend.syncarticles')
            .then(function (data) { return articles.getAll(data); })
            .then(function (articles) { socket.emit('backend.articles', articles); })
            .done();
       
    });
    
    
};


module.exports.start = start;