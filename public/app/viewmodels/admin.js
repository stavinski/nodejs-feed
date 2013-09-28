define(['knockout', 'connection', 'amplify', 'cache', 'contexts/articles', 'contexts/subscriptions'], function (ko, connection, amplify, cache, articlesContext, subscriptionsContext) {
    
    var bindSubscription = function (model) {
        model.unsubscribe = function () {
            model.confirming(true);
        };
        
        model.cancelUnsubscribe = function () {
            model.confirming(false);
        };
        
        model.confirmUnsubscribe = function () {
            var self = this;
            subscriptionsContext.unsubscribe(self._id, function (data) {
                model.confirming(false);
                
                if (data.removed) {
                    // success alert info
                } else {
                    // alert here
                }
            });
        };
        
        model.confirming = ko.observable(false);
        
        return model;
    };
    
    var ViewModel = {
        articleDetailsCache : ko.observable(''),
        subscriptions : ko.computed(function () {
            return subscriptionsContext.subscriptions().map(bindSubscription);
        }),
        activate : function () {
        },
        clearAllCache : function() {
            cache.clearAll();
        }
    };
    
    return ViewModel;
});