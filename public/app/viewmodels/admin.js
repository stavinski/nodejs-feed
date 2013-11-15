define(['knockout', 'contexts/articles', 'contexts/subscriptions', 'cache', 'fastclick', 'notify'], function (ko, articlesContext, subscriptionsContext, cache, fastclick, notify) {
    
    var bindCategory = function (category) {
        return {
                    id : category.replace(/\s/g, '_'),
                    title : category,
                    subscriptions : subscriptionsContext.subscriptions()
                                        .filter(function (subscription) {
                                            return (subscription.category == category);
                                        })
                                        .map(bindSubscription)
        };  
    };
    
    var bindSubscription = function (model) {
        var subscription = $.extend({}, model);
                
        subscription.newCategory = ko.observable('');
        subscription.confirming = ko.observable(false);
        subscription.currentCategory = ko.observable(model.category);
                
        subscription.unsubscribe = function () {
            subscription.confirming(true);
        };
        
        subscription.cancelUnsubscribe = function () {
            subscription.confirming(false);
        };
        
        subscription.confirmUnsubscribe = function () {
            var self = this;
            console.log(self);
            subscriptionsContext.unsubscribe(self._id, function (data) {
                subscription.confirming(false);
                
                if (!data.removed) {
                    notify.error('settings', data.reason, 'could not unsubscribe');
                }
            });
        };
                               
        subscription.changeCategory = function (category) {
            var   self = this
                , selectedCategory = (self.newCategory().length > 0) ? self.newCategory() : category.title
                , meta = {
                    subscription : self._id,
                    category : selectedCategory
                };
                        
            self.newCategory('');
            
            subscriptionsContext.update(meta, function (data) {
                if (!data.updated) {
                    notify.error('settings', data.reason, 'could not update subscription');
                }
            });
        };
        
        subscription.newCategoryValid = ko.computed(function () {
            var self = this;
            return (self.newCategory().length > 0) &&
                    (subscriptionsContext.categories().every(function (category) {
                        return category.toLowerCase() != self.newCategory().toLowerCase();
                    }));
        }, subscription);
        
        return ko.observable(subscription);
    };
    
    var ViewModel = {
        articleDetailsCache : ko.observable(''),
        subscriptions : ko.computed(function () {
            return subscriptionsContext.subscriptions()
                        .map(bindSubscription);
        }),
        categories : ko.computed(function () {
            return subscriptionsContext.categories()
                        .map(bindCategory);
        }),
        activate : function () {
        },
        clearAllCache : function() {
            cache.clearAll();
        },
        attached : function () {
            // prevent clicking the textbox from closing the menu
            $('.setting').on('click', '.dropdown-menu input', function (evt) {
                evt.stopPropagation();
            });
            fastclick.attach(document.body);
        },
        detached : function () {
            
        },
        navItems : [
            { hash : '/#/add', icon : 'fa-plus', text: 'add' }    
        ]
    };
    
    return ViewModel;
});