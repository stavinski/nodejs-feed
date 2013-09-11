define(['models/article', 'Q', 'knockout', 'connection', 'cache'], function (Article, Q, ko, connection, cache) {
            
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
        
        model.collapsed = ko.observable(true);
        model.starred = ko.observable(model.starred);
        model.read = ko.observable(model.read);
        model.content = ko.observable('');
        
        return model;
    };
    
    var ViewModel = {
        _init : false,
        activate : function (subscription) {
            var   self = this
                , filter = 'unread'
                , cacheKey = 'articles:' + filter
                , data = cache.get(cacheKey)
                , since = new Date(0);
            
            self.filter = filter;
            self.subscription = subscription;
            self.articles([]);
            
            if (data) {
                boundArticles = data.articles.map(bindArticle);
                self.articles(boundArticles);
                since = data.timestamp;
            }
            
            connection.send('backend.syncarticles', { filter: filter, since : since });                        
            
            // is this the first time through this vm
            if (self._init) return;
            
            self._init = true;
            self.loading(true);
            return connection.wait()
                    .then(function () {
                        connection.receive('backend.articlesupdated', function (data) {
                            var existing = cache.get('articles:unread');
                            connection.send('backend.syncarticles', { filter: 'unread', since : existing.timestamp });
                        });
                        
                        connection.receive('backend.articles', function (data) {
                            var   cacheKey = 'articles:unread'
                                , current = cache.get(cacheKey);
                            if (current) {
                                current.articles = current.articles.concat(data.articles);
                                current.timestamp = data.timestamp;
                                cache.set(cacheKey, current);
                            } else {
                                cache.set(cacheKey, data);
                            }
                            
                            var updated = cache.get(cacheKey);
                            var boundArticles = updated.articles.map(bindArticle);
                            self.articles(boundArticles);
                            self.loading(false);
                        });
                   });
        },
        loading: ko.observable(false),
        articles: ko.observableArray(),
        filter : '',
        subscription : '',
    };
    
    ViewModel.articlesToShow = ko.computed(function () {
        var self = this;
        
        var articleSort = function (first, second) {
            return second.published - first.published;
        };
        
        self.articles().sort(articleSort);
        return ko.utils.arrayFilter(self.articles(), function(article) {
            return (self.subscription == null) || (article.subscription == self.subscription);
        });
                
    }, ViewModel);
    
    return ViewModel;
});