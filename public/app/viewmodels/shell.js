define(['plugins/router', 'plugins/dialog', 'durandal/app', 'durandal/system', 'amplify', 'models/subscription', 'connection', 'bootstrap','knockout', 'logger', 'cache'], function (router, dialog, app, system, amplify, Subscription, connection, bootstrap, ko, logger, cache) {
    
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
                    
                    connection.send('backend.syncprofile', null, function (data) {
                        cache.set('profile', data);                    
                    });
                                        
                    amplify.subscribe(connection.TOPIC_CONNECTED, function () {
                        self.connected(true);
                    });
                    
                    amplify.subscribe(connection.TOPIC_DISCONNECTED, function () {
                        self.connected(false);
                    });
                })
                .then(function () {
                    return router
                         .map([
                                { route : '', title: 'unread', moduleId : 'viewmodels/unread', hash : '#/unread' },
                                { route : 'unread(/:subscription)', title: 'unread', moduleId : 'viewmodels/unread', hash: '#/unread', nav : true },
                                { route : 'starred(/:subscription)', title: 'starred', moduleId : 'viewmodels/starred', hash : '#/starred', nav : true },
                                { route : 'read(/:subscription)', title: 'read', moduleId : 'viewmodels/read', hash : '#/read', nav : true },
                                { route : 'article/:id', moduleId : 'viewmodels/article', },
                                { route : 'add', moduleId : 'viewmodels/add', title : 'add', hash: '#/add', nav : true },
                                { route : 'admin', moduleId : 'viewmodels/admin', title : 'admin', hash: '#/admin', nav : true },
                                { route : 'welcome', moduleId : 'viewmodels/welcome', title : 'welcome' }
                         ])
                         .buildNavigationModel()
                         .activate();
                });
        },
        attached : function () {
            if (this.unauthorized) {
                dialog.show('viewmodels/signin');
            }
        },
        forceConnection : function () {
            if (this.connected()) return;
            
            connection.reconnect();
        }
    };
    
    return vm;
});