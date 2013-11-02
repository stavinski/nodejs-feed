define(['plugins/router', 'knockout', 'contexts/articles', 'fastclick', 'jquery.lazy', 'moment'], function (router, ko, articlesContext, fastclick, jqueryLazy, moment) {
    
    var mapArticle = function (article) {
        
        article.starToggle = function () {
            articlesContext.starToggle(this._id);            
        }
        
        article.readToggle = function () {
            articlesContext.readToggle(this._id);
        }
        
        return article;      
    };
    
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
            var self = this;
            
            $('#articles-container').hammer().on('hold', '.article', function (evt) {
                var   context = ko.contextFor(this)
                    , data = context.$data;
                    
                self.activeArticle(data._id);
            });
            $(document).hammer().on('scroll', function () {
                self.activeArticle('');    
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
            return ko.utils.arrayMap(articles, mapArticle);
        }, ViewModel);

    return ViewModel;
});