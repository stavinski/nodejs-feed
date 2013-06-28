define(['durandal/plugins/router', 'durandal/app', 'amplify'], function (router, app, events) {
    
    var vm = {
        router: router,
        currentFilter: ko.observable('all'),
        unread: ko.observable(''),
        activate: function () {
            var self = this;
            events.subscribe('filter-changed', function (msg) {
                self.currentFilter(msg.filter);
            });   
            
            events.subscribe('unread-changed', function (msg) {
                self.unread(msg.count);
            });
            
            events.subscribe('admin-screen', function (msg) {
                self.currentFilter('');
            });
            
            return router.activate('dashboard');
        }
    };
    
    return vm;
});