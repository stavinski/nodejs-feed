define(['datacontext', 'amplify', 'bindings/articles'], function(datacontext, events, articleBinding) {
        
    var vm = {
        articles: ko.observableArray(),
        filter: ko.observable('all'),
        refresh: function() { console.log('refresh'); },
        activate: function() {
            var self = this;
            
            var bindArticles = function (articles) {
                self.articles = articleBinding.bind(articles);
            };
            
            var subscribeToFilterChanged = function() {
                events.subscribe('filter-changed', function (msg) {
				self.filter(msg.filter);
                });
            };
            
            return datacontext.getArticles(bindArticles)
                        .then(subscribeToFilterChanged);
		}
    };
    
    return vm;
});