define(['plugins/router','knockout', 'connection', 'Q', 'articleMediator'], function (router, ko, connection, Q, articleMediator) {
    
    var bindArticle = function (data) {
        var   article = data.article
            , vm = article;
        
        vm.starred = ko.observable(article.starred);
        vm.starToggle = function () {
            var self = this;
            
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
            }
        };
        
        return vm;        
    };
    
    var ViewModel = {
        _init : false,
        article : null,
        loading : ko.observable(false),
        goBack : function () {
            router.navigateBack();
            return false;
        },
        activate : function (id) {
            var   self = this
                , data = articleMediator.get(id)
                , deferred = Q.defer();
                                                    
            self.loading(true);
            
            connection.wait()
                    .then(function () {
                        connection.receive('backend.articlesupdated', function (data) {
                            console.log('articles updated');
                        });
                        
                        if (data == null) {
                            connection.send('backend.syncarticle', { id : id }, function (data) {
                                articleMediator.read(data);
                                self.article = bindArticle(data);
                                self.loading(false);
                                deferred.resolve();
                            });
                        } else {
                            articleMediator.read(data);
                            self.article = bindArticle(data);    
                            self.loading(false);
                            deferred.resolve();
                        }
                    });
                    
            return deferred.promise;
        }
    };
    
    return ViewModel;
});