define(['plugins/router','knockout', 'connection', 'cache', 'Q'], function (router, ko, connection, cache, Q) {
       
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
                , cacheKey = 'article:' + id
                , data = cache.get(cacheKey)
                , deferred = Q.defer();
                                                    
            self.loading(true);
            
            connection.wait()
                    .then(function () {
                        if (data == null) {
                            connection.send('backend.syncarticle', { id : id }, function (data) {
                                cache.set(cacheKey, data);
                                self.article = data.article;
                                self.loading(false);
                                deferred.resolve();
                            });
                        } else {
                            self.article = data.article;    
                            self.loading(false);
                            deferred.resolve();
                        }
                    });
                    
            return deferred.promise;
        }
    };
    
    return ViewModel;
});