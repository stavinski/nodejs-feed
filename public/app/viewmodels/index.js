define(['config', 'plugins/router', 'knockout', 'contexts/articles', 'fastclick', 'jquery.lazy', 'moment', 'sharing', 'contexts/subscriptions'], function (config, router, ko, articlesContext, fastclick, jqueryLazy, moment, sharing, subscriptionsContext) {
    
    var mapArticle = function (article) {
        var   vm = $.extend({}, article)
            , published = moment.utc(article.published);
        
        vm.publishedFormatted = ko.computed(function () {
            return published.fromNow();       
        });
        
        vm.starToggle = function () {
            articlesContext.starToggle(this._id);            
        };
        
        vm.readToggle = function () {
            articlesContext.readToggle(this._id);
        };
        
        vm.facebookShareLink = ko.computed(function () {
            return sharing.facebook({
                title : article.title,
                link : article.link
            });
        });
        
        vm.twitterShareLink = ko.computed(function () {
            return sharing.twitter({
                title : article.title,
                link : article.link
            });
        });
        
        return vm;      
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
            fastclick.attach(document.body);
            
            $(".navicon-button").click(function(){
                $(this).toggleClass("open");
                $(".filter-container").toggleClass("open");
            });
            
            $('.articles-container').hammer().on('hold', '.article', function (evt) {
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
        noSubscriptions : ko.computed(function () {
            return (subscriptionsContext.subscriptions().length <= 0);     
        }),
        detached : function () {
            this.activeArticle('');    
        },
        navItems : [
            { hash : '/#/add', icon : 'fa-plus', text: 'add' },
            { hash : '/#/admin', icon : 'fa-cog', text: 'settings' }
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