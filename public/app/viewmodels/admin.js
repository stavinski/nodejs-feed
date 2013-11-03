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
        model.newCategory = ko.observable('');
        model.confirming = ko.observable(false);
        model.currentCategory = ko.observable(model.category);
                
        model.unsubscribe = function () {
            model.confirming(true);
            
            Stashy.Notify({
                content : '#confirm-' + model._id,
                contentType : 'selector',
                style : 'warning'
            }).bar('top');
        };
        
        model.cancelUnsubscribe = function () {
            model.confirming(false);
        };
        
        model.confirmUnsubscribe = function () {
            var self = this;
            subscriptionsContext.unsubscribe(self._id, function (data) {
                model.confirming(false);
                
                if (!data.removed) {
                    notify.error('settings', data.reason, 'could not unsubscribe');
                }
            });
        };
                               
        model.changeCategory = function (category) {
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
        
        model.newCategoryValid = ko.computed(function () {
            var self = this;
            return (self.newCategory().length > 0) &&
                    (subscriptionsContext.categories().every(function (category) {
                        return category.toLowerCase() != self.newCategory().toLowerCase();
                    }));
        }, model);
        
        return ko.observable(model);
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
        navItems : [
            { hash : '/#/add', icon : 'icon-plus', text: 'add' }    
        ]
    };
    
    return ViewModel;
});