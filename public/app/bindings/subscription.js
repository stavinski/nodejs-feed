define(function () {
    
    var bind = function (subscription) {
        var vm = {
            _id : subscription._id,
            subscriptions: ko.observableArray()
        };
        
        var rootSubscriptions = bindSubscriptions(subscription.subscriptions);
        vm.subscriptions(rootSubscriptions);
                            
        return vm;
    };
    
    var bindSubscriptions = function (subscriptions) {
        var len = subscriptions.length,
            results = [];
                    
        for (var i=0; i < len; i++) {
            var item = subscriptions[i],
                vm = {
                    _id: item._id,
                    folder: item.folder,
                    title : ko.observable(item.title),
                    unread: ko.computed(function () { return unreadBinding(item.unread); }),
                    subscriptions : ko.observableArray()
                };
            
            if (item.subscriptions.length > 0)
                vm.subscriptions(bindSubscriptions(item.subscriptions));
            
            results.push(vm);
        }
        
        return results;
    };
    
    var unreadBinding = function (val) {
        return (val == 0) ? '' : val;
    }
    
    return {
        bind : bind
    };
    
});