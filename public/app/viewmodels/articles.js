define(['amplify', 'models/article', 'Q', 'filters'], function (events, Article, Q, filters) {
        
    var filterArticle = function (model) {
        if (!filters.subscription) return true;
        return (model.subscription == filters.subscription);
    };
        
    var bindArticle = function (model) {
        model.headerClicked = function () {
            var self = this;
            Article.load(this.id, function (article) {
                self.content(article.content());
                self.collapsed(!self.collapsed());
            }).then(function () {
                return self.markAsRead();
            });
        };
        
        model.externalLinkClicked = function(data, evt) {
            var self = this;
            self.markAsRead();
            return true;
        };
        
        model.starToggle = function () {
            return this.toggleStarred();
        };
        
        model.collapsed = ko.observable(true);
        
        return model;
    };
        
    var getFindFilter = function () {
        var filter = {};
        if (filters.applied == 'starred') filter.starred = true;
        if (filters.applied == 'read') filter.read = true;
        
        return filter;
    };    
    
    var ViewModel = {
        _refresh : function (force) {
            var self = this;
            self.loading(true);
            return Q.fcall(getFindFilter)
                        .then(function (filter) {
                            self.articles([]);
                            Article.find(filter, force, function (articles) {
                                boundArticles = articles.filter(filterArticle)
                                                        .map(bindArticle);
                                self.articles(boundArticles);
                                self.loading(false);
                            });
                        });
         },
        loading: ko.observable(false),
        articles: ko.observableArray(),
        activate: function() { return this._refresh(false); }
    };
    
    return ViewModel;
});