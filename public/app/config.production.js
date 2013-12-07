define(function() {
    
    config = {};
    
    config.baseUri = 'http://app.pushfeed.net/'
    
    config.api = {};
    config.api.baseUri = '/api/';
    
    config.socketio = {};
    config.socketio.uri = 'ws://app.pushfeed.net:8000';
    
    config.debug = true;
    
    return config;
    
});