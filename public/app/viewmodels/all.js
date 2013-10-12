define(['knockout', 'contexts/articles', 'fastclick', 'jquery.lazy'], function (ko, articlesContext, fastclick, jqueryLazy) {
        
    var ViewModel = {
        activate : function (subscription) {
            var self = this;
            self.subscription(subscription);
        },
        loading: ko.computed(function () { return articlesContext.loading(); }),
        subscription : ko.observable(''),
        filter : 'all',
        attached : function () {
            fastclick.attach(document.body);
            /*
            $('img.lazy').lazy({
                onError : function (elm) {
                    console.log(elm);   
                }
            });
            */
        },
    };
    
    ViewModel.articles = ko.computed(function () {
            var self = this;
            return ko.utils.arrayFilter(articlesContext.articles(), function (article) {
                return (!article.starred()) &&
                        (self.subscription() == null) || (article.subscription == self.subscription());
            });
        }, ViewModel);

    return ViewModel;
});