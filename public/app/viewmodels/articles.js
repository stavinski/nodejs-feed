﻿define(['amplify', 'models/article', 'Q', 'knockout', 'connection'], function (amplify, Article, Q, ko, connection) {
            
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
        model.starred = ko.observable(model.starred);
        model.read = ko.observable(model.read);
        model.content = ko.observable('');
        
        return model;
    };
    
    var ViewModel = {
        activate : function (filter, subscription) {
            var   self = this
                , filter = filter || 'unread';
                        
            self.loading(true);
            return connection.wait()
                    .then(function () {
                        connection.send('backend.syncarticles', { filter: filter, subscription : subscription })
                                .then(function () { return connection.receive('backend.articles'); })
                                .then(function (articles) {
                                    console.log('articles received');
                                    boundArticles = articles.map(bindArticle);
                                    self.articles(boundArticles);
                                    self.loading(false);
                                });
                   });
            
        },
        loading: ko.observable(false),
        articles: ko.observableArray()
    };
    
    return ViewModel;
});