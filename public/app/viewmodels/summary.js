define(['knockout', 'connection', 'contexts/articles'], function (ko, connection, articlesContext) {
       
    var ViewModel = {
        activate : function () {
            
        },
        unreadCounts : ko.computed(function () {
            var   articles = articlesContext.articles()
                , len = articles.length
                , subscriptions = [];
            
            for (var i = 0; i < len; i++) {
                var subscription = articles[i].parent;
                if (subscriptions.indexOf(subscription) == -1)
                    subscriptions.push(subscription);
            }
            
            return subscriptions.map(function (subscription) {
                var matched = articles.filter(function (article) {
                                return ((!article.read()) && (article.parent === subscription));
                            });
                            
                return { title : subscription, count : matched.length };
            });
        }),
        allCount : ko.computed(function () {
            return articlesContext.articles().length;
        }),
        starredCount : ko.computed(function () {
            var starredArticles = articlesContext.articles().filter(function (article) {
                return article.starred();
            });
            
            return starredArticles.length;
        }),
        mostRecent : ko.computed(function () {
            // takes the 3 most recent articles
            return articlesContext.articles().slice(0, 3);
        })
    };
    
    return ViewModel;
});