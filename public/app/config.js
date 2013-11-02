define(function() {
    
    config = {};
    config.api = {};
    config.api.baseUri = '/api/';
    
    config.socketio = {};
    config.socketio.uri = 'ws://pushfeed.local';
   
    config.debug = true;
    
    return config;
    
});