define(['plugins/router', 'plugins/dialog', 'durandal/app', 'durandal/system', 'amplify', 'connection', 'knockout', 'logger', 'cache', 'contexts/articles', 'contexts/user', 'contexts/subscriptions', 'fastclick'], function (router, dialog, app, system, amplify, connection, ko, logger, cache, articlesContext, userContext, subscriptionsContext, fastclick) {
    
    var mapRoutes = function () {
        var instance = router
                         .map([
                                { route : '', title: 'summary', moduleId : 'viewmodels/index', hash : '/#/', nav: true, auth : true },
                                { route : 'signin', title: 'sign-in', moduleId : 'viewmodels/signin', hash : '/#/signin' },
                                { route : 'article/:id', moduleId : 'viewmodels/article', title : 'article', auth : true },
                                { route : 'add', moduleId : 'viewmodels/add', title : 'add', hash: '/#/add', nav : true, auth : true },
                                { route : 'admin', moduleId : 'viewmodels/admin', title : 'admin', hash: '/#/admin', nav : true, auth : true },
                                { route : 'welcome', moduleId : 'viewmodels/welcome', title : 'welcome', auth : true }
                         ])
                         .buildNavigationModel();
        
        instance.guardRoute = function (instance, instruction) {
            if (instruction.config.auth) {
                if (userContext.isSignedIn) {
                    return true;
                } else {
//                    return '/signin/?redirect=' + instruction.fragment;
                    return '/signin/';
                }
            }
            return true;
        };
        
        return instance.activate();
    };
    
    var vm = {
        router: router,
        unauthorized : false,
        connected : ko.observable(false),
        activate: function () {
            var self = this;
            return connection.connect()
                .fail(function (reason) { 
                    // this is dealt with via the guard route                    
                    if (reason == 'handshake unauthorized') {
                        return;
                    }
                    
                    logger.logError('could not connect to backend', reason, system.getModuleId(this), true);
                })
                .then(function () { 
                    self.connected(true);
                    articlesContext.init();
                    subscriptionsContext.init();
                                    
                    connection.send('backend.syncprofile', null, function (data) {
                        userContext.signIn(data.profile);
                    });
                                        
                    amplify.subscribe(connection.TOPIC_CONNECTED, function () {
                        self.connected(true);
                    });
                    
                    amplify.subscribe(connection.TOPIC_DISCONNECTED, function () {
                        self.connected(false);
                    });
                })
                .fail(function (err) { throw err; })
                .fin(mapRoutes);
        },
        forceConnection : function () {
            if (this.connected()) return;
            
            // todo: auth check like above
            connection.connect();
        },
        attached : function () {
            fastclick.attach(document.body);
        }
    };
    
    return vm;
});