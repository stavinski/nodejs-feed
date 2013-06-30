define(['durandal/plugins/router', 'jquery', 'knockout','amplify'], function(router, $, ko, events) {
    
    var vm = {
        activate: function () 
        {
            events.publish('admin-screen');
        },
        router: router
    };
    
    return vm;
});