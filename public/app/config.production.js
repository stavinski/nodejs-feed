define(function() {
    
    config = {};
    
    config.baseUri = 'http://app-pushfeed.rhcloud.com/'
    
    config.api = {};
    config.api.baseUri = '/api/';
    
    config.socketio = {};
    config.socketio.uri = 'ws://app-pushfeed.rhcloud.com:8000';
    
    config.debug = true;
    
    return config;
    
});