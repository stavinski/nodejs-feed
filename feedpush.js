var   config = require('./config')
    , subscriber = require('snrub').createSubscriber({ host : config.app.baseUrl, prefix : '/push' });
    
var feedpush = {
    init : function (app) {
        app.use(subscriber.middleware());
    },
    subscribe : subscriber.subscribe,
    unsubscribe : subscriber.unsubscribe,
    subscribed : function (callback) {
        subscriber.on('subscribe', callback);
    },
    updated : function (callback) {
        subscriber.on('update', callback);
    }
};

module.exports = feedpush;