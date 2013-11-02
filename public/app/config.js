define(function() {
    
    config = {};
    
    config.baseUri = 'http://pushfeed.local:3000/'
    
    config.api = {};
    config.api.baseUri = '/api/';
    
    config.socketio = {};
    config.socketio.uri = 'ws://pushfeed.local';
   
    config.debug = true;
    
    return config;
    
});