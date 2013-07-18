define(['../logger', '../config', '../durandal/system', '../datacache'], function(logger, config, system, cache) {
    
    var Subscription = function(vals) {
        this.title = vals.title;
        this.id = vals._id;
        this.url = vals.url;
        this.folder = vals.folder;
        this.unread = ko.observable(vals.unread);
    };
        
    var queryFailed = function(qXHR) {
        logger.logError('Could not load subscriptions', qXHR, system.getModuleId(this), true);     
    };
    
    var querySucceeded = function(callback, data) {
        var subscriptions = [];
        data.forEach(function (item) {
            subscriptions.push(new Subscription(item));
        });
        
        if (!cache.has('subscriptions'))
            cache.set('subscriptions', subscriptions);
            
        callback(subscriptions);
    };
    
    Subscription.loadAll = function (callback) {
        if (cache.has('subscriptions')) {
            var subscriptions = cache.get('subscriptions');
            callback(subscriptions);
            return new $.Deferred().resolve();
        }
    
        return $.getJSON(config.api.baseUri + 'subscriptions/')
                .fail(queryFailed)
                .done(function (data) { querySucceeded(callback, data); });
    };
    
    return Subscription;
});