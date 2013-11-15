define(['plugins/router', 'knockout', 'contexts/articles', 'moment', 'fastclick', 'Q', 'sharing'], function (router, ko, articlesContext, moment, fastclick, Q, sharing) {
    
    var bindArticle = function (article) {
        var   vm = $.extend({}, article)
            , published = moment.utc(article.published);
                
        vm.starToggle = function () {
            articlesContext.starToggle(this.article._id);
        };
        
        vm.publishedFormatted = ko.computed(function () {
            return published.date() + ' ' +
                    published.format('MMM').toLowerCase() + ' ' +
                    published.year();
        });
        
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
        
        vm.content = ko.computed(function () {
            var articleContent = $('<body></body>')
                                    .html(this.content);
            articleContent.find('a')
                .each(function () {
                    var href = $(this).attr('href');
                    $(this).attr('href','javascript:externalLink("' + href + '");');
                });
            
            return articleContent.html();
        }, vm);
        
        vm.showExternal = function () {
            externalLink(this.article.link);
        };
        
        return vm;        
    };
   
    var ViewModel = {
        loading : ko.observable(false),
        id : '',
        article : null,
        nextArticle : null,
        prevArticle : null,
        activate : function (id) {
            var   self = this
                , deferred = Q.defer();
            
            self.loading(true);
                        
            articlesContext.read(id, function (data) {
                self.loading(false);
                
                if (data.status == 'success') {
                    self.article = bindArticle(data.article);
                    self.nextArticle = articlesContext.next(id);
                    self.prevArticle = articlesContext.prev(id);
                } else { 
                    // handle err    
                }
                
                deferred.resolve();
            });
            
            return deferred.promise;
        },
        prev : function () {
            if (this.prevArticle != null)
                router.navigate('#/article/' + this.prevArticle._id);
        },
        next : function () {
            if (this.nextArticle != null)
                router.navigate('#/article/' + this.nextArticle._id);
        },
        closeExternal : function () {
            $('.external iframe').attr('src', '');
            $('.external').hide();
            $('.article').show();
        },
        attached : function () {
            var self = this;
            fastclick.attach(document.body);
            
            // allow swipe navigation
            $(document).hammer().on('swipeleft', function () { self.next(); });
            $(document).hammer().on('swiperight', function () { self.prev(); });
            
            window.externalLink = function (src) {
                $('.external iframe').attr('src', src);
                $('.external').show();
                $('.article').hide();
            };
        }
    };
    
    return ViewModel;
});