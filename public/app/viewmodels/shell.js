define(['durandal/plugins/router', 'durandal/app', 'amplify'], function (router, app, events) {
    
    var vm = {
        router: router,
        currentFilter: ko.observable(''),
        unread: ko.observable(''),
        activate: function () {
            var self = this;
            router.onNavigationComplete = function(routeInfo, params, module) {
                if (routeInfo.moduleId == 'viewmodels/dashboard') {
                    var filter = (params.filter) ? params.filter : '';
                    self.currentFilter(filter);
                    events.publish('filter-changed', { filter: filter });
                }                
            };
            
            events.subscribe('unread-changed', function (msg) {
                self.unread(msg.count);
            });
                        
            return router.activate('dashboard');
        }
    };
    
    return vm;
});