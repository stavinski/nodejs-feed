define(['amplify', 'datacontext', 'logger', 'durandal/system'], function (events, datacontext, logger, system) {
    
    var headerClicked = function (data) {
        var self = this;
        
        var failed = function () {
            // reset the vm binding
            self.read(false);
            // and notify the user
            logger.logError('Could not mark the article as read', self, system.getModuleId(self), true);
        };
            
        self.collapsed(!self.collapsed());
        
        // if were collapsing the article were not interested
        if (self.collapsed()) return;
        
        // if we have already read then were not interested
        if (self.read()) return;
        
        // however if not we need to set this article as read
        // usually this will work so on the UI ypdate the vm binding
        self.read(true);
        
        datacontext.markArticleRead(2, 0)
                .fail(failed)
                .done(function (data) {
                    if (data.status == 'success') {
                        // raise an event so subscribers are notified
                        events.publish('article-read');
                        return;
                    }
                    failed();
                });;
    };
    
    var starToggle = function (data) {
        this.starred(!this.starred());
    };
    
    var bind = function (articles) {
        var len = articles.length,
            bindings = [];
              
         var subscriptionsLen = subscriptions.length,
                    bindings = []; 
              
        for (var i=0; i < len; i++) {
            var item = articles[i],
                vm = {
                    title : item.title,
                    link : item.link,
                    content: item.content,
                    published : item.published,
                    author: item.author,
                    starred : ko.observable(item.starred),
                    read : ko.observable(item.read),
                    headerClicked : headerClicked,
                    starToggle : starToggle,
                    collapsed: ko.observable(true)
                };
            bindings.push(vm); 
        }
        
        return ko.observableArray(bindings);    
    };
    
    return {
        bind : bind
    };
    
});