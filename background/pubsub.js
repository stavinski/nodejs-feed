var   subscriptions = require('../data/subscriptions')
    , feedpush = require('../feedpush')
    , config = require('../config')
    , Q = require('q');

var renewSubscription = function (subscription) {
    return feedpush.subscribe(subscription);
};

var execute = function() {
    console.log('pubsub bg task');
    return subscriptions.getForPubSubRenewal()
        .then(function (results) {
            console.log('for renewal [%d]', results.length);
            return Q.all(results.map(renewSubscription));
        })
        .fail (function (err) {
            console.error(err);
        })
        .fin (function () {
            console.log('pubsub bg task end');
            setTimeout(execute, config.background.pollMs);
        }); 
};

module.exports.start = function () {
    if (config.background.pubsubActive)
        return execute();
    
    return;
};