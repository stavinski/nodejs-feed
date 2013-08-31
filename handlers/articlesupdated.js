var   config = require('../config')
    , io = require('socket.io-client')
    , Q = require('q');
    
var init = function (clientSocket, user) {
    var bgSocket = io.connect('ws://' + config.app.ipaddress + ':' + config.background.port);
    console.log('connect');
    // when the bg sends that articles have been changed
    // forward to the client
    bgSocket.on('bg.articlesupdated', function (data) {
        clientSocket.emit('backend.articlesupdated', data);    
    });
    
    // pass through the user so the bg can decide which subscriptions were interested in changes for
    bgSocket.emit('bg.connection', { timestamp : new Date(), user : user });
        
    // when the client disconnects disconnect from bg
    clientSocket.on('disconnect', function () {
        console.log('disconnect');
        bgSocket.disconnect();
    });
    
};

module.exports.init = init;