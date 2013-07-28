define(['../logger', '../config', '../durandal/system', '../datacache'], function(logger, config, system, cache) {
    
    var Article = function(vals) {
        this.title = vals.title;
        this.id = vals._id;
        this.link = vals.link;
        this.content = ko.observable(vals.content);
        this.read = ko.observable(vals.read);
        this.starred = ko.observable(vals.starred);
        this.published = vals.published;
        this.author = vals.author;
        this.subscription = vals.subscription;
    };
    
    var buildCacheKey = function (filter) {
        var   key = 'articles'
            , filter = filter || {};
        
        if (filter.read) key += '_read_' + filter.read;
        if (filter.starred) key += '_starred_' + filter.starred;

        return key;
    };
        
    var queryFailed = function(qXHR) {
        logger.logError('Could not load articles', qXHR, system.getModuleId(this), true);     
    };
    
    var updateFailed = function(qXHR) {
        logger.logError('Could not update article', qXHR, system.getModuleId(this), true);     
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
    
    var updateCaches = function (article) {
        var key = 'article_' + article.id;
        if (cache.has(key)) {
            cache.set(key, article);
        }
    };
    
    var postArticleUpdate = function (article) {
        return Q($.post(config.api.baseUri + 'articles/' + article.id, article.serialize()));
                    //.then(function () { updateCaches(this); });
    };
    
    // instance methods
    Article.prototype.markAsRead = function() {
        var self = this;
        self.read(true);
        return postArticleUpdate(self)
                .fail(function (err) { self.read(true); updateFailed(err); });
    };
    
    Article.prototype.toggleStarred = function () {
        var self = this;
        self.starred(!self.starred());
        return postArticleUpdate(this)
            .fail(function (err) { self.starred(!self.starred()); updateFailed(err); });
    };
    
    Article.prototype.serialize = function () {
        var self = this;
        var result = {
            read : self.read(),
            starred : self.starred()
        };
        
        return result;
    };
    
    // non instance methods
    Article.deserialize = function (data) {
        return new Article(data);
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
    
    Article.find = function (filter, force, callback) {
        var key = buildCacheKey(filter);
        if ((!force) && (cache.has(key))) {
            var articles = cache.get(key);
            callback(articles);
            return new $.Deferred().resolve();
        }
    
        return $.getJSON(config.api.baseUri + 'articles/', filter)
                .fail(queryFailed)
                .done(function (data) { querySucceeded(callback, data, filter); });
    };
    
    return Article;
});