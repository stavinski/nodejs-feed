define(['knockout', 'contexts/articles', 'contexts/subscriptions', 'cache', 'fastclick'], function (ko, articlesContext, subscriptionsContext, cache, fastclick) {
    
    var bindSubscription = function (model) {
        model.newCategory = ko.observable('');
        model.confirming = ko.observable(false);
        model.currentCategory = ko.observable(model.category);
                
        model.unsubscribe = function () {
            model.confirming(true);
        };
        
        model.cancelUnsubscribe = function () {
            model.confirming(false);
        };
        
        model.confirmUnsubscribe = function () {
            var self = this;
            subscriptionsContext.unsubscribe(self._id, function (data) {
                model.confirming(false);
                
                if (data.removed) {
                    // success alert info
                } else {
                    // alert here
                }
            });
        };
                               
        model.changeCategory = function (category) {
            var   self = this
                , selectedCategory = (self.newCategory().length > 0) ? self.newCategory() : category
                , meta = {
                    subscription : self._id,
                    category : selectedCategory
                };
                        
            self.newCategory('');
            
            subscriptionsContext.update(meta, function (data) {
                if (data.updated) {
                    // success alert info
                    model.currentCategory(meta.category);
                } else {
                    // alert here
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
            return subscriptionsContext.categories();    
        }),
        activate : function () {
        },
        clearAllCache : function() {
            cache.clearAll();
        },
         attached : function () {
            // prevent clicking the textbox from closing the menu
            $('#subscriptions').on('click', '.dropdown-menu input', function (evt) {
                evt.stopPropagation();
            });
            fastclick.attach(document.body);
        },
        navItems : [
            { hash : '/#/add', icon : 'icon-plus' }    
        ]
    };
    
    return ViewModel;
});