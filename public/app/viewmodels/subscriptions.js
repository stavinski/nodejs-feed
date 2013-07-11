define(['durandal/plugins/router', 'models/subscription'], function(router, Subscription) {
     
   
   var ViewModel = {
        subscriptions: ko.observableArray(),
        router: router,
		activate: function () {
            var self = this;
            return Subscription.loadAll(function (subscriptions) {
                self.subscriptions(subscriptions);
            });
		}
    };
    
    return ViewModel;
            
});