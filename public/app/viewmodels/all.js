define(['knockout', 'connection', 'cache', 'contexts/articles'], function (ko, connection, cache, articlesContext) {
        
    var ViewModel = {
        activate : function (subscription) {
            var self = this;
            self.subscription(subscription);
        },
        loading: articlesContext.loading,
        subscription : ko.observable(''),
        articles : ko.computed(function () {
            var self = this;
            return ko.utils.arrayFilter(articlesContext.articles(), function (article) {
                return (!article.starred);
//                        (self.subscription() == null) || (article.subscription == self.subscription());
            });
        })
    };

    return ViewModel;
});