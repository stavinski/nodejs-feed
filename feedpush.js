var   config = require('./config')
    , subscriber = require('snrub').createSubscriber({ host : config.app.baseUrl, prefix : '/push', secret : config.feedpush.secret });
    
var feedpush = {
    init : function (app) {
        app.use(subscriber.middleware());
    },
    subscribe : function (hub, topic) { 
        subscriber.subscribe(hub, topic, null, function success(result) {
            console.log('success ' + result);
        }, function error(code) {
            console.log('error ' + code);
        }); },
    unsubscribe : function (hub, topic) { subscriber.unsubscribe(hub, topic); },
    subscribed : function (callback) {
        subscriber.on('subscribe', callback);
    },
    updated : function (callback) {
        subscriber.on('update', callback);
    }
};

module.exports = feedpush;