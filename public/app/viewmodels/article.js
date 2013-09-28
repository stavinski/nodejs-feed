define(['plugins/router', 'knockout', 'contexts/articles'], function (router, ko, articlesContext) {
    
    var bindArticle = function (article) {
        var vm = article;
                
        vm.starToggle = function () {
            articlesContext.starToggle(this.article._id);
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
            var self = this;
            self.loading(true);
                        
            return articlesContext.read(id)
                    .then(bindArticle)
                    .then(function (article) {
                        self.loading(false);
                        self.article = bindArticle(article);
                        self.nextArticle = articlesContext.next(id);
                        self.prevArticle = articlesContext.prev(id);
                    })
                    .fail(function (err) {
                        self.loading(false);
                        // display err
                    });
        },
        prev : function () {
            router.navigate('#/article/' + this.prevArticle._id);
        },
        next : function () {
            router.navigate('#/article/' + this.nextArticle._id);
        }
    };
    
    return ViewModel;
});