define(['knockout', 'jquery', 'uri', 'contexts/subscriptions', 'fastclick'], function (ko, $, uri, subscriptionsContext, fastclick) {
    
    var mapResult = function (result) {
        result.domain = uri(result.link).host;
        
        result.canSubscribe = ko.computed(function () {
            return subscriptionsContext.subscriptions().every(function (subscription) {
                return decodeURIComponent(subscription.xmlurl).toLowerCase() !== decodeURIComponent(result.url).toLowerCase();
            });
        });
        
        result.subscribe = function(category) {
            var   self = this
                , selectedCategory = (self.newCategory().length > 0) ? self.newCategory() : category;
                        
            self.subscribing(true);
            self.newCategory('');
            var handleSubscription = function (result) {
                if (result.added) {
                    // display success info        
                } else {
                    // handle err    
                }
                                
                self.subscribing(false);
            };
            
            subscriptionsContext.subscribe(self.url, selectedCategory, handleSubscription);
        };
        
        result.subscribing = ko.observable(false);
        result.newCategory = ko.observable('');
        
        result.newCategoryValid = ko.computed(function () {
            var self = this;
            return (self.newCategory().length > 0) &&
                    (subscriptionsContext.categories().every(function (category) {
                        return category.toLowerCase() != self.newCategory().toLowerCase();
                    }));
        }, result);
                
        return result;
    };
    
    ViewModel = {
        activate : function () {
            
        },
        attached : function () {
            // prevent clicking the textbox from closing the menu
            $('#add').on('click', '.dropdown-menu input', function (evt) {
                evt.stopPropagation();
            });
            
            fastclick.attach(document.body);        
        },
        deactivate : function () {
            this.results.removeAll();
            this.query('');
            this.resultQuery('');
            
            return false;
        },
        query : ko.observable(''),
        results : ko.observableArray(),
        loading : ko.observable(false),
        resultQuery : ko.observable(''),
        search : function (limit) {
            var   self = this
                , searchUrl = 'https://ajax.googleapis.com/ajax/services/feed/find?v=1.0&callback=?';
            
            if (self.query().length > 0) {
                self.loading(true);
                self.results.removeAll();
                
                $.getJSON(searchUrl, { q : self.query() })
                .fail(function (err) { console.log('alert here'); })
                .always(function () { 
                    self.loading(false); 
                    self.resultQuery(self.query());
                })
                .done(function (data) {
                    if (data.responseStatus == 200) {
                        var mapped = data.responseData.entries.map(mapResult);
                        self.results(mapped);    
                    } else {
                        // handle err
                        console.log('err retrieving');
                    }                        
                });
            } else {
                // display alert
            }        
        },
        categories : ko.computed(function () {
            return subscriptionsContext.categories();
        })
    };
    
    ViewModel.queryEntered = ko.computed(function () {
            return $.trim(this.query()).length > 0;
        }, ViewModel);
        
    return ViewModel;
    
});
