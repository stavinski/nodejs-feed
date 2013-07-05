﻿define(['durandal/plugins/router', 'durandal/app', 'amplify', 'datacontext'], function (router, app, events, datacontext) {
    
    var vm = {
        router: router,
        currentFilter: ko.observable('all'),
        unread: ko.observable(''),
        activate: function () {
            var self = this;
            router.onNavigationComplete = function(routeInfo, params, module) {
                if (routeInfo.moduleId == 'viewmodels/dashboard') {
                    var filter = (params.filter) ? params.filter : 'all';
                    self.currentFilter(filter);
                    events.publish('filter-changed', { filter: filter });
                }                
            };
            
            events.subscribe('unread-changed', function (msg) {
                self.unread(msg.count);
            });
                        
            return router.activate('dashboard')
                        .then(datacontext.populateSummaryData);
                    
        }
    };
    
    return vm;
});