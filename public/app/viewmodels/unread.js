define(['models/article', 'Q', 'knockout', 'connection', 'cache', 'articleMediator'], function (Article, Q, ko, connection, cache, articleMediator) {
        
    var ViewModel = {
        _init : false,
        activate : function (subscription) {
            var self = this;
            
            self.filter = 'unread';
            self.subscription(subscription);
                        
            // is this the first time through this vm
            if (self._init) return;
                    
            self._init = true;
            self.loading(true);
                        
            articleMediator.initUnread(function () { self.loading(false); })           
        },
        loading: ko.observable(false),
        filter : '',
        subscription : ko.observable('')
    };
    
    ViewModel.articlesToShow = ko.computed(function () {
        var self = this;
        return ko.utils.arrayFilter(articleMediator.unreadArticlesBinding(), function(article) {
            return (self.subscription() == null) || (article.subscription == self.subscription());
        });
                
    }, ViewModel);
    
    return ViewModel;
});