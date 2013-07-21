﻿define(['amplify', 'models/article', 'Q'], function (events, Article, Q) {
        
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
        
    var getFindFilter = function (val) {
        var filter = {};
        if (val == 'starred') filter.starred = true;
        if (val == 'read') filter.read = true;
        
        return filter;
    };    
    
    var ViewModel = {
        _refresh : function (force) {
            var self = this;
            return Q.fcall(getFindFilter, this.filter())
                        .then(function (filter) {
                            Article.find(filter, force, function (articles) {
                                boundArticles = articles.map(bindArticle);
                                self.articles(boundArticles);
                            });
                        }).then(function() {
                            events.subscribe('filter-changed', function (msg) {
                                self.filter(msg.filter);
                            });
                        });
         },
        articles: ko.observableArray(),
        filter: ko.observable(''),
        refresh: function() { this._refresh(true); },
        activate: function() { return this._refresh(false); }
    };
    
    return ViewModel;
});