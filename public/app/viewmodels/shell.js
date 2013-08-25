define(['plugins/router', 'durandal/app', 'durandal/system', 'amplify', 'models/subscription', 'connection', 'bootstrap','knockout', 'logger'], function (router, app, system, amplify, Subscription, connection, bootstrap, ko, logger) {
    
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
                    amplify.subscribe(connection.TOPIC_CONNECTED, function () {
                        self.connected(true);
                        logger.log('connected to backend', null, system.getModuleId(this), true);
                    });
                    
                    amplify.subscribe(connection.TOPIC_DISCONNECTED, function () {
                        self.connected(false);
                        logger.log('disconnected from backend', null, system.getModuleId(this), true);
                    });
                })
                .then(function () {
                    return router.makeRelative({ moduleId: 'viewmodels' })
                         .map([
                                { route : 'dashboard/:filter(/:subscription)', title : 'Unread', moduleId : 'articles', nav : true },
                                { route : 'article/:id', moduleId : 'article', },
                                { route : 'admin', moduleId : 'admin', nav : true }
                         ])
                         .mapUnknownRoutes('articles')
                         .buildNavigationModel()
                         .activate();
                });
        },
        viewAttached : function () {
            if (this.unauthorized) {
                $('#signin').modal();
            }
        }
    };
    
    return vm;
});