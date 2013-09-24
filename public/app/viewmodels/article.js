define(['plugins/router','knockout', 'connection', 'Q', 'articleMediator', 'contexts/articles'], function (router, ko, connection, Q, articleMediator, articlesContext) {
    
    var bindArticle = function (article) {
        var vm = article;
        
        vm.starred = ko.observable(article.starred);
        vm.starToggle = function () {
            var self = this;
            /*
            if (self.starred()) {
                connection.send('backend.articleunstarred', { id : article._id } , function (result) {
                    if (result.status == 'success') {
                        self.starred(false);
                        articleMediator.unstarred(data);
                    } else {
                        // display alert or sumthin   
                    }
                });          
            } else {
                connection.send('backend.articlestarred', { id : article._id } , function (result) {
                    if (result.status == 'success') {
                        self.starred(true);
                        articleMediator.starred(data);
                    } else {
                        // display alert or sumthin   
                    }
                });      
            }*/
        };
        
        return vm;        
    };
    
    var ViewModel = {
        loading : ko.observable(false),
        id : '',
        article : null,
        nextArticle : null,
        prevArticle : null,
        goBack : function () {
            router.navigateBack();
            return false;
        },
        activate : function (id) {
            var self = this;
            self.loading(true);
                        
            return articlesContext.read(id)
                    .then(bindArticle)
                    .then(function (article) {
                        self.loading(false);
                        self.article = article;
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