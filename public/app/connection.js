define(['socket.io', 'Q', 'amplify'], function (sio, Q, amplify) {
    var   io = null
        , connectionDeferred = Q.defer()
        , TOPIC_CONNECTED = 'backend.connected'
        , TOPIC_DISCONNECTED = 'backend.disconnected'
        , TOPIC_ERROR = 'backend.error';
    
    var monitorConnection = function () {
        io.on('connect', function () {
            amplify.publish(TOPIC_CONNECTED);
        });
        
        io.on('reconnect', function () { 
            amplify.publish(TOPIC_CONNECTED);
        });
        
        io.on('error', function (reason) { 
            amplify.publish(TOPIC_ERROR, reason); 
        });
        
        io.on('disconnect', function () {
            amplify.publish(TOPIC_DISCONNECTED);
        });
                
    };
    
    var _wait = function () {
        return connectionDeferred.promise;
    };
    
    var _connect = function () {
        io = sio.connect();
        monitorConnection();
        
        amplify.subscribe(TOPIC_CONNECTED, function () {
            connectionDeferred.resolve();
        });
        
        amplify.subscribe(TOPIC_ERROR, function (reason) {
            connectionDeferred.reject(reason);
        });
               
        return connectionDeferred.promise;
    };
    
    var _oncall = function (evt) {
        var deferred = Q.defer();
        io.on(evt, function (data) {
            deferred.resolve(data);
        });
        
        return deferred.promise;
    };
    
    var _emitcall = function (evt, data) {
        return Q.fcall(function () { io.emit(evt, data); });
    };
    
    var _receive = function (evt, callback) {
        io.on(evt, callback);
    };
    
    var _send = function (evt, data) {
        return _emitcall(evt, data);
    };
    
    return {
        wait : _wait,
        connect : _connect,
        receive : _receive,
        send : _send,
        TOPIC_CONNECTED : TOPIC_CONNECTED,
        TOPIC_DISCONNECTED : TOPIC_DISCONNECTED,
        TOPIC_ERROR : TOPIC_ERROR
    };
});