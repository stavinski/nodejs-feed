define(['cache'], function (cache) {
    
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
    
    var cacheArticle = function (article) {
        var articleCacheKey = cacheKeys.ARTICLE + article._id
            , expires = 7 * 24 * 60 * 60;
        
        cache.set(articleCacheKey, { timestamp : new Date(), article : article }, expires);
    };
    
    var moveArticle = function (data, fromCacheKey, toCacheKey) {
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
    };
    
    var toggleStarred = function (data, starred) {
        var   articleCacheKey = cacheKeys.ARTICLE + data.article._id
            , articleCache = cache.get(articleCacheKey);
                    
        if (articleCache) {
            var article = articleCache.article;
            article.starred = starred;
            cache.set(articleCacheKey,{ timestamp : new Date(), article : article });
        }  
    };
    
    var read = function (data) {
        cacheArticle(data.article);
        moveArticle(data, cacheKeys.UNREAD, cacheKeys.READ);
    };
    
    var starred = function (data) {
        toggleStarred(data, true);
        moveArticle(data, cacheKeys.READ, cacheKeys.STARRED);
    };
    
    var unstarred = function (data) {
        toggleStarred(data, false);
        moveArticle(data, cacheKeys.STARRED, cacheKeys.READ);
    };
    
    var get = function (id) {
        return cache.get(cacheKeys.ARTICLE + id);        
    };
    
    var getUnread = function () {
        return cache.get(cacheKeys.UNREAD) || { timestamp : new Date(), articles : [] };
    };
    
    return {
        read : read,
        starred : starred,
        unstarred : unstarred,
        get : get,
        getUnread : getUnread
    };
});