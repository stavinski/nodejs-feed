define(['plugins/router', 'knockout', 'connection', 'cache', 'jquery', 'contexts/subscriptions', 'contexts/articles', 'uri', 'fastclick'], function(router, ko, connection, cache, $, subscriptionsContext, articlesContext, uri, fastclick) {
   
    var bindSubscription = function (model) {
          
        model.unread = ko.computed(function () {
            var self = model;
            var results = articlesContext.articles().filter(function (article) {
                                return ((article.subscription == self._id) && (!article.read()))        
                            });
            return (results.length > 0) ? results.length : '';
        });
        
        if (router.activeItem().subscription)        
            model.active = ko.observable(router.activeItem().subscription() == model._id);
        
        model.domain = uri(model.favicon).host;
                
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
        subscriptions: ko.computed(function () {
            return subscriptionsContext.subscriptions().map(bindSubscription);
        }),
        attached : function () {
            fastclick.attach(document.body);
        }
    };
    
    return ViewModel;
            
});