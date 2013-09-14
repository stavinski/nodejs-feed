define(function() {
    
    config = {};
    config.api = {};
    config.api.baseUri = '/api/';
    
    config.socketio = {};
    config.socketio.uri = 'ws://pushfeed.local';
    
    config.toastr = {};
    config.toastr.options = {
        positionClass : 'toast-bottom-right'
    };
    
    config.debug = true;
    
    return config;
    
});