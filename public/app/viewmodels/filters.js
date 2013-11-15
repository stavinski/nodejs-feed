define(['plugins/router', 'knockout', 'connection', 'cache', 'jquery', 'contexts/subscriptions', 'contexts/articles', 'uri', 'fastclick'], function(router, ko, connection, cache, $, subscriptionsContext, articlesContext, uri, fastclick) {

    var bindCategory = function (category) {
        return {
                    id : category.replace(/\s/g,'_'),
                    title : category,
                    collapsed : ko.observable(true),
                    subscriptions : subscriptionsContext.subscriptions()
                                        .filter(function (subscription) {
                                            return subscription.category == category;
                                        })
                                        .map(bindSubscription),
                    toggleCollapse : function () {
                        this.collapsed(!this.collapsed());
                        return true;
                    },
                    unread : ko.computed(function () {
                        var self = category
                            , subscriptionIds = subscriptionsContext.subscriptions()
                                                .filter(function (subscription) {
                                                    return subscription.category == category;
                                                })
                                                .map(function (subscription) {
                                                    return subscription._id;    
                                                });
                        
                        var count = subscriptionIds.map(function (id) {
                                        var results = articlesContext.articles().filter(function (article) {
                                                        return ((article.subscription == id) && (!article.read()))        
                                                    });
                                        return results.length;
                                    })
                                    .reduce(function (prev, next) {
                                        return prev + next;    
                                    });
                        
                        return (count > 0) ? count : '';                         
                    })
        };
    };
    
    var bindSubscription = function (model) {  
        model.unread = ko.computed(function () {
            var self = model;
            var results = articlesContext.articles().filter(function (article) {
                                return ((article.subscription == self._id) && (!article.read()))        
                            });
            return (results.length > 0) ? results.length : '';
        });
                                
        return model;
    };
    
    var ViewModel = {
        activate: function () {
            
        },
        makeActive : function () {
            var   self = this
                , route = '#/' + router.activeItem().filter + '/';
                        
            router.navigate(route + self._id);
            return false;
        },
        attached : function () {
            fastclick.attach(document.body);
        },
        categories : ko.computed(function () {
            var categories = subscriptionsContext.categories();
            return categories.map(bindCategory);
        }),
        allUnread : ko.computed(function () {
            var found = ko.utils.arrayFilter(articlesContext.articles(), function (article) {
                return !article.read();
            });
            
            return (found.length > 0) ? found.length : '';
        }),
        starredUnread : ko.computed(function () {
            var found = ko.utils.arrayFilter(articlesContext.articles(), function (article) {
                return (!article.read()) && (article.starred());
            });
            
            return (found.length > 0) ? found.length : '';
        })
    };
    
    return ViewModel;
            
});