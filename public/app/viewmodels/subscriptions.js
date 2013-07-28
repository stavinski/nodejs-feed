﻿define(['durandal/plugins/router', 'models/subscription', 'filters'], function(router, Subscription, filters) {
   
   var bindSubscription = function (model) {
                
        model.unread = ko.computed(function () {
            return (model.unread() != 0) ? model.unread() : '';
        });
                        
        console.log(filters);                
        model.active = ko.observable(model.id == filters.subscription);
        return model;
    };
   
   var ViewModel = {
        subscriptions: ko.observableArray(),
        router: router,
		activate: function () {
            var self = this;
            return Subscription.loadAll(function (subscriptions) {
                boundSubscriptions = subscriptions.map(bindSubscription);
                self.subscriptions(boundSubscriptions);
            });
		},
        makeActive : function () {
            var   self = this
                , route = '#/dashboard';
            
            if (filters.applied) route += '/' + filters.applied;
            router.navigateTo(route + '/' + self.id);
            return false;
        }
    };
    
    return ViewModel;
            
});