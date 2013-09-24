define(['knockout', 'connection', 'contexts/articles'], function (ko, connection, articlesContext) {
       
    var ViewModel = {
        activate : function () {
            var self = this;
            
            connection.send('backend.syncsummary', 
                            null, 
                            function (data) { 
                                self.unreadCounts(data.summary);
                            });
        },
        unreadCounts : ko.observableArray(),
        mostRecent : ko.computed(function () {
            // takes the 3 most recent articles
            return articlesContext.articles().slice(0, 3);
        })
    };
    
    return ViewModel;
});