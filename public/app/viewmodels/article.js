define(['plugins/router', 'knockout', 'contexts/articles', 'moment', 'fastclick', 'Q'], function (router, ko, articlesContext, moment, fastclick, Q) {
    
    var bindArticle = function (article) {
        var   vm = article
            , published = moment.utc(article.published);
                
        vm.starToggle = function () {
            articlesContext.starToggle(this.article._id);
        };
        
        vm.publishedFormatted = ko.computed(function () {
            return published.date() + ' ' +
                    published.format('MMM').toLowerCase() + ' ' +
                    published.year();
        });
        
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
            router.navigate('#/article/' + this.prevArticle._id);
        },
        next : function () {
            router.navigate('#/article/' + this.nextArticle._id);
        },
        attached : function () {
            fastclick.attach(document.body);
            
            $(".navicon-button").click(function(){
                $(this).toggleClass("open");
                $(".cat-menu").toggleClass("open");
            });
        }
    };
    
    return ViewModel;
});