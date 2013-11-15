var   config = require('./config')
    , mubsub = require('mubsub')
    , Q = require('q');

var bus = {
    _client : null,
    _getClient : function () {
        if (this._client == null) {
            this._client = mubsub(config.db.url + 'pushfeed');
        }
        
        return this._client;
    },
    publish : function (evt, msg) {
        var channel = this._getClient().channel('bg');
                
        //client.on('error', console.error);
        //channel.on('error', console.error);
                
        channel.publish(evt, msg, function (err) {
            //console.log(err);    
        }); 
    },
    subscribe : function (evt, callback) {
        var channel = this._getClient().channel('bg');
        return channel.subscribe(evt, callback);
    },
    close : function () {
        this._getClient().close();    
    }
};

module.exports = bus;