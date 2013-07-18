define(['amplify', 'models/article'], function (events, Article) {
        
    var bindArticle = function (model) {
        
        model.headerClicked = function () {
            var self = this;
            self.loading(true);
            Article.load(this.id, function (article) {
                self.content(article.content());
                self.loading(false);
                self.collapsed(!self.collapsed());
            });            
        };
        
        model.starToggle = function () {
            console.log('star toggle');
        };
        
        model.collapsed = ko.observable(true);
        model.loading = ko.observable(false);
        
        return model;
    };
        
    var ViewModel = {
        articles: ko.observableArray(),
        filter: ko.observable('all'),
        refresh: function() { console.log('refresh'); },
        activate: function() {
            var self = this;
            
            return Article.find(function (articles) {
                boundArticles = articles.map(bindArticle);
                self.articles(boundArticles);
            });
            
            /*
            var subscribeToFilterChanged = function() {
                events.subscribe('filter-changed', function (msg) {
				self.filter(msg.filter);
                });
            };
            */
            
		}
    };
    
    return ViewModel;
});