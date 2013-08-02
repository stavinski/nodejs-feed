define(['durandal/plugins/router', 'durandal/app', 'amplify', 'models/subscription'], function (router, app, events, Subscription) {
    
    var vm = {
        router: router,
        currentFilter: ko.observable(''),
        unread: ko.observable(''),
        activate: function () {
            var self = this;
            
            return Subscription.loadAll(function (subscriptions) {
                        var count = subscriptions
                                        .map(function (subscription) { return subscription.unread(); })
                                        .reduce(function (prev, current) { return prev + current; });
                        self.unread((count == 0) ? '' : count);
                        
                   }).then(function () {
                        router.activate('dashboard')
                   });
        }
    };
    
    return vm;
});