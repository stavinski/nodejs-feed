define(['durandal/plugins/router', 'amplify', 'db/subscriptionsdb'], function(router, events, db) {
    
    var vm = {
        subscriptions: ko.observableArray(),
        router : router,
		activate: function () {
            this.subscriptions(db.getAll());
		}
    };
    
    return vm;
            
});