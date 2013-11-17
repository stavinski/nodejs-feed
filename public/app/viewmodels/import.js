define(['knockout', 'jquery.fileupload', 'contexts/subscriptions'], function (ko, fileUpload, subscriptionsContext) {
    
    var bindFeed = function (feed) {
        var duplicate = subscriptionsContext.subscriptions().every(function (subscription) {
            return decodeURIComponent(subscription.xmlurl).toLowerCase() === decodeURIComponent(feed.xmlurl).toLowerCase();
        });
        
        // if we are already subscribed then default to error status
        feed.status = (duplicate) ? ko.observable('error') : ko.observable('processing');
        feed.errorReason = (duplicate) ? ko.observable('already subscribed to this feed') : ko.observable('');
        
        return feed;
    };
            
    var ViewModel = {
        attached : function () {
            var self = this;
            $('#fileupload').fileupload({
                dataType: 'json',
                done: function uploadDone(e, data) {
                    if (data.result.status == 'success') {
                        var feeds = ko.utils.arrayMap(data.result.feeds, bindFeed);
                        self.importFeeds(feeds);
                                                
                        ko.utils.arrayForEach(self.importFeeds(), function feedSubcribe(feed) {
                            var handleSubscription = function (result) {
                                var status = (result.added) ? 'success' : 'error';
                                feed.status(status);
                                feed.errorReason(result.reason);                                
                            };
                                                    
                            subscriptionsContext.subscribe(feed.xmlurl, feed.folder, handleSubscription);    
                        });
                        
                    } else {
                        self.importError(data.result.reason);        
                    }
                }
            });    
        },
        importFeeds : ko.observableArray(),
        importError : ko.observable(''),
        detached : function () {
            
        },
        navItems : [
            { hash : '/#/add', icon : 'fa-plus', text: 'add' },
            { hash : '/#/admin', icon : 'fa-cog', text: 'settings' }
        ]
    };
    
    return ViewModel;
    
});