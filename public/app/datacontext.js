define(['config','logger', 'durandal/system', 'bindings/subscription'], function(config, logger, system, subscriptionBinding) {
   
    // keep the data in memory so we dont have to hit the server each time
    var cache = {
        subscription : null
    
    };
   
    var retrievalFailure = function (qXHR) {
        logger.logError('Failed to retrieve data', qXHR, system.getModuleId(this), true);
    };
    
    var populateSummaryData = function () {
        var noop = function (data) {};
        return getSubscription(noop, true);
    };
    
    var getSubscription = function (callback, force) {
        var doBind = function (data) {
            var bindedSubscription = subscriptionBinding.bind(data);
            callback(bindedSubscription);
        };
    
        if ((force) || (!cache.subscription)) {
            return $.getJSON(config.api.baseUrl + 'subscriptions/')
                    .done(function (data) {
                        cache.subscription = data.subscription;
                        doBind(cache.subscription);
                    })
                    .fail(retrievalFailure);
        }
    
        doBind(cache.subscription);
        return $.Deferred().resolve();
    };
   

    return {
        populateSummaryData : populateSummaryData,
        getSubscription : getSubscription
    };
                    
});