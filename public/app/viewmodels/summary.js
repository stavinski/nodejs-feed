define(['knockout', 'connection', 'contexts/articles', 'contexts/subscriptions'], function (ko, connection, articlesContext, subscriptionsContext) {
       
    var ViewModel = {
        activate : function () {
            
        },
        unreadCounts : ko.computed(function () {
            var   subscriptions = subscriptionsContext.subscriptions()
                , articles = articlesContext.articles();
            
            return subscriptions.map(function (subscription) {
                 var found = articles.filter(function (article) {
                     return ((article.subscription == subscription._id) &&
                            (!article.read()))
                            
                 });
                 return { title : subscription.title, count : found.length };
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