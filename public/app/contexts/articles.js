define(['connection', 'cache', 'knockout', 'Q', 'knockoutmapping'], function (connection, cache, ko, Q, mapping) {
    
    var sortArticles = function (prev, next) {
        var prevDate = new Date(prev.published)
            nextDate = new Date(next.published);
        
        return nextDate - prevDate;  
    };
    
    var articleMappingOptions = {
        observe : ['starred', 'read'],
        copy : ['_id', 'title', 'author', 'content', 'published', 'categories', 'parent', 'favicon']
    };
    
    var context = {
        _cachePrefix : 'articles',
        _init : false,
        _getCache : function () {
            // null function pattern ?
            return cache.get(this._cachePrefix)
                    || { timestamp : new Date(0), articles : [] };
        },
        _setCache : function () {
            var data = {
                timestamp : new Date(),
                articles : mapping.toJS(this.articles)
            };
            
            cache.set(this._cachePrefix, data);
        },
        _sync : function () {
            var   self = this
                , cached = self._getCache();
            
            self.loading(true);
            connection.send('backend.syncarticles', { since : cached.timestamp }, function (data) {
                self.loading(false);
                if (data.status == 'success') {
                    var underlyingArray = self.articles();
                    data.articles.forEach(function (newArticle) {
                        underlyingArray.push(mapping.fromJS(newArticle, articleMappingOptions));
                    });
                    underlyingArray.sort(sortArticles);
                    self.articles.valueHasMutated();
                    self._setCache();
                } else {
                    // inform user we are only have local cached articles available for browsing
                }
            });
        },
        _locateById : function (id) {
            var   self = this
                , len = self.articles().length;
            
            for (var i=0; i < len; i++) {
                var article = self.articles()[i];
                if (article._id === id) 
                    return { index : i, article : article};
            }
            
            return null;
        },
        init : function () {
            var self = this;
            
            if (self._init) return; // just in case it calls again
            self._init = true;
            var cached = self._getCache();
            
            var underlyingArray = self.articles();
            cached.articles.forEach(function (article) {
                underlyingArray.push(mapping.fromJS(article, articleMappingOptions));
            });
            underlyingArray.sort(sortArticles);
            self._sync();
                        
            connection.receive('backend.articlesupdated', function (data) {
                self._sync();    
            });
        },
        read : function (id) {
            var   self = this
                , deferred = Q.defer();
                        
            var found = this._locateById(id);
            if (found != null) {
                connection.send('backend.syncarticle', { id : id }, function (data) {
                    if (data.status == 'success') {
                        // store article details into cache
                        var foundArticle = self.articles()[found.index];
                        foundArticle.read(true);
                        foundArticle.content = data.article.content;
                        self._setCache();
                        self.articles.valueHasMutated();
                        deferred.resolve(foundArticle);
                    } else {
                        deferred.reject(new Error('could not retrieve article'));   
                    }
                });
            } else {
                deferred.resolve(null);
            }
            
            return deferred.promise;
        },
        starToggle : function (id) {
            var   self = this;
                        
            var found = this._locateById(id);
            
            if (found != null) {
                var   isStarred = found.article.starred()
                    , evt = (isStarred) ? 'backend.articleunstarred' : 'backend.articlestarred';
                
                connection.send(evt, { id : id }, function (data) {
                    if (data.status == 'success') {
                        // store article details into cache
                        var foundArticle = self.articles()[found.index];
                        foundArticle.starred(!isStarred);
                        self._setCache();
                        self.articles.valueHasMutated();
                    } else {
                        // handle err
                    }
                });
            }
        },
        prev : function (id) {
            var self = this;
            var found = self._locateById(id);
            if (found == null) 
                return null;
            
            var index = self.articles().indexOf(found.article);
            if (self.articles()[index -1])
                return self.articles()[index -1];
            
            return null;
        },
        next : function (id) {
            var self = this;
            var found = self._locateById(id);
            if (found == null) 
                return null;
            
            var index = self.articles().indexOf(found.article);
            if (self.articles()[index + 1])
                return self.articles()[index + 1];
            
            return null;
        },
        articles : ko.observableArray(),
        loading : ko.observable(false)
    };
    
    return context;
});