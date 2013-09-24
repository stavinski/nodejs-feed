define(['knockout', 'connection', 'amplify', 'cache', 'subscriptionMediator', 'articleMediator'], function (ko, connection, amplify, cache, subscriptionMediator, articleMediator) {
    
    var bindSubscription = function (model) {
        model.unsubscribe = function () {
            model.confirming(true);
        };
        
        model.cancelUnsubscribe = function () {
            model.confirming(false);
        };
        
        model.confirmUnsubscribe = function () {
            var self = this;
            connection.send('backend.unsubscribe', { id : self._id }, function (data) {
                model.confirming(false);
                if (data.status == 'success') {
                    subscriptionMediator.remove(data);                            
                } else {
                    // alert here
                }
            });
        };
        
        model.confirming = ko.observable(false);
        
        return model;
    };
    
    var handleSubscriptions = function (data, self) {
        if (data.status == 'success') {
            subscriptionMediator.addMultiple(data);
        } else {
            // alert here    
        }
    };
    
    var ViewModel = {
        _init : false,    
        articleDetailsCache : ko.observable(''),
        saveCache : function () {
            
        },
        subscriptions : ko.computed(function () {
            var subscriptions = subscriptionMediator.subscriptionsBinding();
            return subscriptions.map(bindSubscription);
        }),
        activate : function () {
            var self = this;
            
            if (self._init) return;
            
            self._init = true;
            connection.send('backend.syncsubscriptions', 
                            { since : subscriptionMediator.lastDownload() }, 
                            function (data) { handleSubscriptions(data, self); });
        },
        clearAllCache : function() {
            cache.clearAll();
        }
    };
    
    return ViewModel;
});