define(['plugins/router', 'durandal/app', 'durandal/system', 'amplify', 'models/subscription', 'connection', 'bootstrap','knockout', 'logger', 'cache'], function (router, app, system, amplify, Subscription, connection, bootstrap, ko, logger, cache) {
    
    var vm = {
        router: router,
        currentFilter: ko.observable(''),
        unread: ko.observable(''),
        unauthorized : false,
        connected : ko.observable(false),
        activate: function () {
            var self = this;
                 
            return connection.connect()
                .fail(function (reason) { 
                    if (reason == 'handshake unauthorized') {
                        self.unauthorized = true;
                        return;
                    }
                    
                    logger.logError('could not connect to backend', reason, system.getModuleId(this), true);
                })
                .then(function () { 
                    self.connected(true);
                    connection.receive('backend.profile', function (data) {
                        cache.set('profile', data);                    
                    });
                    connection.send('backend.syncprofile');
                                        
                    amplify.subscribe(connection.TOPIC_CONNECTED, function () {
                        self.connected(true);
                    });
                    
                    amplify.subscribe(connection.TOPIC_DISCONNECTED, function () {
                        self.connected(false);
                    });
                })
                .then(function () {
                    return router.makeRelative({ moduleId: 'viewmodels' })
                         .map([
                                { route : ':filter(/:subscription)', title: 'dashboard', moduleId : 'articles', nav : true },
                                { route : 'article/:id', moduleId : 'article', },
                                { route : 'admin', moduleId : 'admin', nav : true }
                         ])
                         .mapUnknownRoutes('articles')
                         .buildNavigationModel()
                         .activate();
                });
        },
        attached : function () {
            if (this.unauthorized) {
                $('#signin').modal();
            }
        },
        forceConnection : function () {
            if (this.connected()) return;
            
            connection.connect();
        }
    };
    
    return vm;
});