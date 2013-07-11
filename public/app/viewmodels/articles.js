define(['amplify'], function (events) {
        
    var vm = {
        articles: ko.observableArray(),
        filter: ko.observable('all'),
        refresh: function() { console.log('refresh'); },
        activate: function() {
            var self = this;
           
            
            var subscribeToFilterChanged = function() {
                events.subscribe('filter-changed', function (msg) {
				self.filter(msg.filter);
                });
            };
            
		}
    };
    
    return vm;
});