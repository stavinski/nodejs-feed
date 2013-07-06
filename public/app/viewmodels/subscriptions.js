define(['durandal/plugins/router', 'amplify', 'datacontext', 'bindings/subscriptions'], function(router, events, datacontext, subscriptionBinding) {
        
       
    var vm = {
        subscriptions: null,
        router: router,
		activate: function () {
            var self = this;
            return datacontext.getSubscriptions(function (subscriptions) {
                self.subscriptions = subscriptionBinding.bind(subscriptions);
            });
		}
    };
    
    return vm;
            
});