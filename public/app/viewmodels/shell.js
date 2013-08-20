define(['durandal/plugins/router', 'durandal/app', 'amplify', 'models/subscription', 'connection', 'bootstrap'], function (router, app, events, Subscription, connection, bootstrap) {
    
    var vm = {
        router: router,
        currentFilter: ko.observable(''),
        unread: ko.observable(''),
        unauthorized : false,
        activate: function () {
            var self = this;
            
            return connection.connect()
                    .fail(function (reason) { 
                        if (reason == 'handshake unauthorized') {
                            self.unauthorized = true;
                            return;
                        }
                        
                        // display standard err in toast
                    })
                    .done();
            
            /*
            return Subscription.loadAll(function (subscriptions) {
                        var count = subscriptions
                                        .map(function (subscription) { return subscription.unread(); })
                                        .reduce(function (prev, current) { return prev + current; });
                        self.unread((count == 0) ? '' : count);
                        
                   }).then(function () {
                        router.activate('dashboard')
                   });
            */
        },
        viewAttached : function () {
            if (this.unauthorized) {
                $('#signin').modal();
            }
        }
    };
    
    return vm;
});