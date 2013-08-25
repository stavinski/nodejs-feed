define(['plugins/router', 'models/subscription', 'filters', 'knockout', 'amplify', 'connection'], function(router, Subscription, filters, ko, amplify, connection) {
   
   var bindSubscription = function (model) {
        
        /*
        model.unread = ko.computed(function () {
            return (model.unread() != 0) ? model.unread() : '';
        });
        */
        
        model.active = ko.observable(model.id == filters.subscription);
        return model;
    };
   
   
   var ViewModel = {
        subscriptions: ko.observableArray(),
        router: router,
		activate: function () {
            var self = this;
            self.subscriptions([]);
            return connection.wait()
                    .then(function () {
                        connection.receive('backend.subscriptions', function (subscriptions) {
                            boundSubscriptions = subscriptions.map(bindSubscription);
                            self.subscriptions(boundSubscriptions);
                        });
                        
                        connection.send('backend.syncsubscriptions');
                    });
        },
        makeActive : function () {
            var   self = this
                , route = '#/dashboard';
            
            if (filters.applied) route += '/' + filters.applied;
            router.navigateTo(route + '/' + self.id);
            return false;
        }
    };
    
    return ViewModel;
            
});