define(['../logger', '../config', '../durandal/system', '../datasource', '../datacache'], function(logger, config, system, datasource, cache) {
    
    var Article = function(vals) {
        this.title = vals.title;
        this.id = vals._id;
        this.link = vals.link;
        this.content = ko.observable(vals.content);
        this.read = ko.observable(vals.read);
        this.starred = ko.observable(vals.starred);
        this.published = vals.published;
        this.author = vals.author;
    };
    
    var buildCacheKey = function (filter) {
        var   key = 'articles'
            , filter = filter || {};
        
        if (filter.read) key += '_read_' + filter.read;
        if (filter.starred) key += '_starred_' + filter.starred;

        return key;
    };
        
    var queryFailed = function(qXHR) {
        logger.logError('Could not load aricles', qXHR, system.getModuleId(this), true);     
    };
    
    var querySucceeded = function(callback, data, filter) {
        var articles = [];
        data.forEach(function (item) {
            articles.push(new Article(item));
        });
        
        var key = buildCacheKey(filter);
        if (!cache.has(key))
            cache.set(key, articles);
            
        callback(articles);
    };
    
    var getSucceeded = function (callback, data) {
        var   key = 'article_' + data._id
            , article = new Article(data);
        if (!cache.has(key))
            cache.set(key, article);
        
        callback(article);
    };
    
    Article.load = function (id, callback) {
        var key = 'article_' + id;
        if (cache.has(key)) {
            callback(cache.get(key));
            return new $.Deferred().resolve();
        }
        
        return $.getJSON(config.api.baseUri + 'articles/' + id)
                .fail(queryFailed)
                .done(function (data) { getSucceeded(callback, data); });
    };
    
    Article.find = function (callback, filter) {
        var key = buildCacheKey(filter);
        if (cache.has(key)) {
            var articles = cache.get(key);
            callback(articles);
            return new $.Deferred().resolve();
        }
    
        return $.getJSON(config.api.baseUri + 'articles/', { filter: filter })
                .fail(queryFailed)
                .done(function (data) { querySucceeded(callback, data, filter); });
    };
    
    return Article;
});