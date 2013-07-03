define(['durandal/plugins/router', 'amplify', 'datacontext'], function(router, events, datacontext) {
    
    var vm = {
        subscriptions: datacontext.subscriptions,
        router : router,
		activate: function () {
            
		}
    };
    
    return vm;
            
});