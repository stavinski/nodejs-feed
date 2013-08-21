define(['plugins/router', 'durandal/app', 'amplify', 'models/subscription', 'connection', 'bootstrap','knockout'], function (router, app, events, Subscription, connection, bootstrap, ko) {
    
    var vm = {
        router: router,
        currentFilter: ko.observable(''),
        unread: ko.observable(''),
        unauthorized : false,
        activate: function () {
            var self = this;
            return router.makeRelative({ moduleId: 'viewmodels' })
                         .map([
                                { route : '', title : 'Unread', moduleId : 'dashboard/unread', nav : true },
                                { route : 'unread(/:id)', title : 'Unread', moduleId : 'dashboard/unread', nav : true },
                                { route : 'starred(/:id)', title : 'Starred', moduleId : 'dashboard/starred', nav : true },
                                { route : 'read(/:id)', title : 'Read', moduleId : 'dashboard/read', nav : true },
                                { route : 'article/:id', moduleId : 'article', },
                                { route : 'admin', moduleId : 'admin', nav : true }
                         ])
                         .mapUnknownRoutes('', 'dashboard/unread')
                         .buildNavigationModel()
                         .activate()
                         .then(function () {
                            return connection.connect()
                                        .fail(function (reason) { 
                                            if (reason == 'handshake unauthorized') {
                                                self.unauthorized = true;
                                                return;
                                            }
                                            
                                            // display standard err in toast
                                        });
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