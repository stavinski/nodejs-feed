define(['knockout', 'contexts/articles', 'contexts/subscriptions', 'contexts/user', 'fastclick'], function (ko, articlesContext, subscriptionsContext, userContext, fastclick) {
       
    var ViewModel = {
        activate : function () {
            
        },
        unreadCounts : ko.computed(function () {
            if (!userContext.isSignedIn) return;
            
            var   subscriptions = subscriptionsContext.subscriptions()
                , articles = articlesContext.articles()
                , categories = userContext.details.categories;
            
            return categories.map(function (category) {
                var matchedSubscriptions = subscriptions.filter(function (subscription) {
                     return (subscription.category == category);
                });
                                
                var unread = matchedSubscriptions.map(function (subscription) {
                    var found = articles.filter(function (article) {
                        return ((article.subscription == subscription._id) &&
                            (!article.read()))               
                    });
                    
                    return { title : subscription.title, count : found.length };
                });
                
                return {
                    title : category,
                    count : unread.map(function(item) { return item.count; })
                                  .reduce(function (prev, next) { return prev + next; }),
                    subscriptions : unread
                };
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
        }),
        attached : function () {
            fastclick.attach(document.body);
        }
    };
    
    return ViewModel;
});