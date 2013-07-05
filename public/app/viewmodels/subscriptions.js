define(['durandal/plugins/router', 'amplify', 'datacontext'], function(router, events, datacontext) {
        
       
    var vm = {
        subscription: null,
        router: router,
		activate: function () {
            var self = this;
            return datacontext.getSubscription(function (data) {
                self.subscription = data;
            });
		}
    };
    
    return vm;
            
});