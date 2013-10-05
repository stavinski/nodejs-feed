define(['knockout', 'contexts/articles', 'contexts/subscriptions', 'contexts/user', 'cache', 'fastclick'], function (ko, articlesContext, subscriptionsContext, userContext, cache, fastclick) {
    
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
        categories : ko.computed (function () {
            return userContext.details.categories;
        }),
        activate : function () {
        },
        clearAllCache : function() {
            cache.clearAll();
        },
         attached : function () {
            fastclick.attach(document.body);
        }
    };
    
    return ViewModel;
});