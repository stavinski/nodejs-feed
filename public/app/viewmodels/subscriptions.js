define(['plugins/router', 'models/subscription', 'knockout', 'connection', 'cache'], function(router, Subscription, ko, connection, cache) {
   
   var bindSubscription = function (model) {
        
        /*
        model.unread = ko.computed(function () {
            return (model.unread() != 0) ? model.unread() : '';
        });
        */
        
        model.active = ko.observable(router.activeItem().subscription == model._id);
        return model;
    };
   
   
   var ViewModel = {
        _init : false,
        subscriptions: ko.observableArray(),
        router: router,
		activate: function () {
            var self = this;
            self.subscriptions([]);
            
            var   data = cache.get('subscriptions')
                , since = new Date(0);
                
            if (data) {
                var boundSubscriptions = data.subscriptions.map(bindSubscription);
                self.subscriptions(boundSubscriptions);
                since = data.timestamp;
            }
            
            // is this the first time through this vm 
            if (self._init) return;
            
            self._init = true;
            return connection.wait()
                    .then(function () {
                        connection.receive('backend.subscriptions', function (data) {
                            var current = cache.get('subscriptions');
                            if (current) {
                                current.subscriptions.concat(data.subscriptions);
                                current.timestamp = data.timestamp;
                                cache.set('subscriptions', current);
                            } else {
                                cache.set('subscriptions', data);
                            }
                            
                            var updated = cache.get('subscriptions');
                            var boundSubscriptions = updated.subscriptions.map(bindSubscription);
                            self.subscriptions(boundSubscriptions);
                        });
                        
                        connection.send('backend.syncsubscriptions', { since : since });
                    });
        },
        makeActive : function () {
            var   self = this
                , route = '#/' + router.activeItem().filter + '/';
                        
            router.navigate(route + self._id);
            return false;
        }
    };
    
    return ViewModel;
            
});