define(['config','logger', 'durandal/system'], function(config, logger, system) {
   
    // keep the data in memory so we dont have to hit the server each time
    var cache = {
        _subscriptions: [],
        setSubscriptions : function (subscriptions) {
            this._subscriptions = subscriptions;
        },
        
        // return a copy so that the viewmodel can change it withour affecting others
        getSubscriptions : function() {
            return (JSON.parse(JSON.stringify(this._subscriptions)));
        },
        hasSubscriptions : function() {
            return (this._subscriptions.length > 0);
        }
    
    };
   
    var retrievalFailure = function (qXHR) {
        logger.logError('Failed to retrieve data', qXHR, system.getModuleId(this), true);
    };
    
    var saveFailure = function (qXHR) {
        logger.logError('Failed to save data', qXHR, system.getModuleId(this), true);
    };
    
    var populateSummaryData = function () {
        var noop = function (data) {};
        return getSubscriptions(noop, true);
    };
    
    var getSubscriptions = function (callback, force) {
        if ((force) || (!cache.hasSubscriptions())) {
            return $.getJSON(config.api.baseUrl + 'subscriptions/')
                    .done(function (data) {
                        cache.setSubscriptions(data);
                        callback(cache.getSubscriptions());
                    })
                    .fail(retrievalFailure);
        }
    
        callback(cache.getSubscriptions());
        return $.Deferred().resolve();
    };
    
    var getArticles = function (callback) {
        var extractArticles = function(subscriptions) {
            var   len = subscriptions.length
                , articles = [];
                        
            for (var i = 0; i < len; i++) {
                var   subscription = subscriptions[i]
                    , articlesLen = subscription.articles.length;
                
                for (var j = 0; j < articlesLen; j++) {
                    articles.push(subscription.articles[j]);
                }
            }
                        
            callback(articles);
        };
        
        return this.getSubscriptions(extractArticles);
    };
    
    var markArticleRead = function (subscriptionId, index) {
        return $.post(config.api.baseUrl + 'subscriptions/' + subscriptionId + '/articles/' + index + '/read'); 
    };
   
    return {
        populateSummaryData : populateSummaryData,
        getSubscriptions : getSubscriptions,
        getArticles : getArticles,
        markArticleRead : markArticleRead
    };
                    
});