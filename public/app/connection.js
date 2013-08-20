define(['socket.io', 'Q'], function (sio, Q) {
    var io = null;
    var _connect = function () {
        io = sio.connect();
        
        var deferred = Q.defer();
        io.on('connect', function () { deferred.resolve(); });
        io.on('error', function (reason) { deferred.reject(reason); });
        
        return deferred.promise;
    };
    
    var _receive = function (evt, callback) {
        io.on(evt, callback);
    };
    
    var _send = function (evt, data) {
        io.emit(evt, data);
    };
    
    return {
        connect : _connect,
        receive : _receive,
        send : _send
    };
});