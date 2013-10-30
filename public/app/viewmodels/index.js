define(['plugins/router', 'knockout', 'contexts/articles', 'fastclick', 'jquery.lazy', 'moment'], function (router, ko, articlesContext, fastclick, jqueryLazy, moment) {
    
    var ViewModel = {
        activate : function (subscription) {
            var self = this;
            self.subscription(subscription);
        },
        loading: ko.computed(function () { return articlesContext.loading(); }),
        subscription : ko.observable(''),
        activeArticle : ko.observable(''),
        filter : 'all',
        view : function () {
            router.navigate('#/article/' + this._id);
            return false;
        },
        attached : function () {
            $('#articles-container').hammer().on('hold', '.article', function (evt) {
                var   context = ko.contextFor(this)
                    , data = context.$data
                    , vm = context.$root;
                    
                vm.activeArticle(data._id);
            });
                        
            /*
            $('img.lazy').lazy({
                onError : function (elm) {
                    console.log(elm);   
                }
            });
            */
        },
        navItems : [
            { hash : '/#/add', icon : 'icon-plus', text: 'add' },
            { hash : '/#/admin', icon : 'icon-cog', text: 'settings' }
        ]
    };
    
    ViewModel.articles = ko.computed(function () {
            var   self = this
                , articles = ko.utils.arrayFilter(articlesContext.articles(), function (article) {
                    return ((self.subscription() == null) || (article.subscription == self.subscription()));
                });
            return articles;
        }, ViewModel);

    return ViewModel;
});