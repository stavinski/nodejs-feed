var   config = require('../config')
    , download = require('./download')
    , cleanup = require('./cleanup')
    , Q = require('q')
    , sio = require('socket.io').listen(config.background.port);

var start = function () {
    //sio.set('log level', config.socketio.loglevel);
    //sio.set('transports', ['websocket']);
    
    sio.sockets.on('connection', function (socket) {
        console.log('host connnection');
    
       // we receieved a connection from backend
       socket.on('bg.connection', function (data) {
          // let download & cleanup know so they can monitor
          // for related article changes
          
          console.log('bg connnection');
       });
       
       socket.on('disconnected', function () {
          console.log('bg disconnect');
       });
    });
        
    // kick off the background workers
    //download.start();
    //cleanup.start();
};  
  
start();