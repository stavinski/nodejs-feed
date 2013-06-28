define(['durandal/plugins/router', 'jquery', 'knockout', 'amplify'], function(router, $, ko, events) {
    
    var vm = {
        activate: function (data) 
        { 
            var filter = (data.filter) ? data.filter : 'all';
            events.publish('filter-changed', { filter : filter });
        },
        router: router
    };
    
    return vm;
});