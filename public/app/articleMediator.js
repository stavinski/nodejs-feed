define(['cache', 'knockout', 'connection'], function (cache, ko, connection) {
    
    var cacheKeys = {
        ARTICLE : 'article:',
        UNREAD : 'articles:unread',
        READ : 'articles:read',
        STARRED : 'articles:starred',
    };
    
    var sortArticles = function (prev, next) {
        var prevDate = new Date(prev.published)
            nextDate = new Date(next.published);
        
        return nextDate - prevDate;  
    };
    
    var ArticleMediator = {
        cacheArticle : function (article) {
            var articleCacheKey = cacheKeys.ARTICLE + article._id
                , expires = 7 * 24 * 60 * 60;
            
            cache.set(articleCacheKey, { timestamp : new Date(), article : article }, expires);
        },
        moveArticle : function (data, fromCacheKey, toCacheKey) {
            var   article = data.article
                , fromCache = cache.get(fromCacheKey) || { timestamp : new Date(), articles : [] }
                , toCache = cache.get(toCacheKey) || { timestamp : new Date(), articles : [] }
                , fromArticles = fromCache.articles || [];
            
            // remove from cache
            var filteredFromArticles = fromArticles.filter(function (article) {
                return article._id != data.article._id;
            });
            cache.set(fromCacheKey, { timestamp : data.timestamp, articles : filteredFromArticles });
            
            var doesNotExist = toCache.articles.every(function (article) {
                                    return article._id != data.article._id;    
                                });
            if (doesNotExist) {
                // add to other cache
                toCache.articles.push(data.article);
                toCache.articles.sort(sortArticles);
                cache.set(toCacheKey, toCache);         
            }
        },
        toggleStarred : function (data, starred) {
            var   articleCacheKey = cacheKeys.ARTICLE + data.article._id
                , articleCache = cache.get(articleCacheKey);
                        
            if (articleCache) {
                var article = articleCache.article;
                article.starred = starred;
                cache.set(articleCacheKey,{ timestamp : new Date(), article : article });
            }  
        },
        read : function (data) {
            this.cacheArticle(data.article);
            this.moveArticle(data, cacheKeys.UNREAD, cacheKeys.READ);
        },
        starred : function (data) {
            this.toggleStarred(data, true);
            this.moveArticle(data, cacheKeys.READ, cacheKeys.STARRED);
        },
        unstarred : function (data) {
            this.toggleStarred(data, false);
            this.moveArticle(data, cacheKeys.STARRED, cacheKeys.READ);
        },
        get : function (id) {
            return cache.get(cacheKeys.ARTICLE + id);        
        },
        removeAll : function (subscription) {
            // remove from all caches where article is associated with subscription
            
        },
        _getUnreadCache : function () {
            var current = cache.get(cacheKeys.UNREAD);
            return current || { timestamp : new Date(0), articles : [] };
        },
        initUnread : function (callback) {
            var self = this;
            
            self.unreadArticlesBinding(this._getUnreadCache().articles);
            connection.send('backend.syncunreadarticles', 
                            { since : this._getUnreadCache().timestamp }, 
                            function (data) { 
                                console.log('synced');
                                var existing = self.unreadArticlesBinding();
                                self.unreadArticlesBinding(existing.concat(data.articles));
                                self.unreadArticlesBinding.sort(sortArticles);
                                data.articles = self.unreadArticlesBinding();
                                cache.set(cacheKeys.UNREAD, data);
                                callback();
                            });

            connection.receive('backend.articlesupdated', function (data) {
                connection.send('backend.syncunreadarticles', 
                                { since : this._getUnreadCache().timestamp }, 
                                function (data) { 
                                    self.unreadArticlesBinding(data.articles);
                                    cache.set(cacheKeys.UNREAD, data);
                                });
            });            
        },
        syncAll : function (subscription) {
            
        },
        unreadArticlesBinding : ko.observableArray([])
    };
       
    
    return ArticleMediator;
    
});