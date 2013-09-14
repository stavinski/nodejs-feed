define(['plugins/router', 'models/subscription', 'knockout', 'connection', 'cache', 'jquery', 'articleMediator', 'subscriptionMediator'], function(router, Subscription, ko, connection, cache, $, articleMediator, subscriptionMediator) {
   
    var bindSubscription = function (model) {
        var   subscription = model
            , unreadArticles = articleMediator.getUnread().articles;
               
        model.unread = ko.computed(function () {
            var self = model;
            var results = unreadArticles.filter(function (article) {
                                return (article.subscription == self._id);        
                            });
            return (results.length > 0) ? results.length : '';
        });
                
        model.active = ko.observable(router.activeItem().subscription == model._id);
        return model;
    };
    
    var handleSubscriptions = function (data, self) {
        if (data.status == 'success') {
            subscriptionMediator.addMultiple(data);
        } else {
            // alert here    
        }
    };

    var ViewModel = {
        _init : false,
        router: router,
        activate: function () {
            var self = this;
                                    
            // is this the first time through this vm 
            if (self._init) return;
            
            self._init = true;
            connection.send('backend.syncsubscriptions', 
                            { since : subscriptionMediator.lastDownload() }, 
                            function (data) { handleSubscriptions(data, self); });
        },
        makeActive : function () {
            var   self = this
                , route = '#/' + router.activeItem().filter + '/';
                        
            router.navigate(route + self._id);
            return false;
        },
        subscriptions: ko.computed(function () {
            var subscriptions = subscriptionMediator.subscriptionsBinding();
            return subscriptions.map(bindSubscription);
        })
    };
    
    return ViewModel;
            
});