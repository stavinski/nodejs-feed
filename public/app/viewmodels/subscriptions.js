define(['durandal/plugins/router', 'models/subscription'], function(router, Subscription) {
   
   var bindSubscription = function (model) {
                
        model.unread = ko.computed(function () {
            return (model.unread() != 0) ? model.unread() : '';
        });
        
        return model;
    };
   
   var ViewModel = {
        subscriptions: ko.observableArray(),
        router: router,
		activate: function () {
            var self = this;
            return Subscription.loadAll(function (subscriptions) {
                boundSubscriptions = subscriptions.map(bindSubscription);
                self.subscriptions(boundSubscriptions);
            });
		}
    };
    
    return ViewModel;
            
});