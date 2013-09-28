define(['knockout', 'jquery', 'uri', 'contexts/subscriptions'], function (ko, $, uri, subscriptionsContext) {
    
    var mapResult = function (result) {
        result.domain = uri(result.link).host;
        
        result.canSubscribe = ko.computed(function () {
            return subscriptionsContext.subscriptions().every(function (subscription) {
                return decodeURIComponent(subscription.xmlurl).toLowerCase() !== decodeURIComponent(result.url).toLowerCase();
            });
        });
        
        result.subscribe = function() {
            var self = this;
            self.subscribing(true);
            
            var handleSubscription = function (result) {
                if (result.added) {
                    // display success info        
                } else {
                    // handle err    
                }
                                
                self.subscribing(false);
            };
            
            subscriptionsContext.subscribe(self.url, handleSubscription);
        };
        
        result.subscribing = ko.observable(false);
        
        return result;
    };
    
    ViewModel = {
        activate : function () {
            
        },
        deactivate : function () {
            this.results.removeAll();
            this.query('');
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
                        console.log(mapped);
                        self.results(mapped);    
                    } else {
                        // handle err
                        console.log('err retrieving');
                    }                        
                });
            } else {
                // display alert
            }        
        }
    };
    
    ViewModel.queryEntered = ko.computed(function () {
            return $.trim(this.query()).length > 0;
        }, ViewModel);
        
    return ViewModel;
    
});
