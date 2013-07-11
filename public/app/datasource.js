define(['./config'], function(config) {
    
    var Search = function(options) {
        this.uri = config.api.baseUri + options.uri;
        this.model = options.model;
        this.conditions = [];
    };
    
    Search.prototype.and = function(arg, callback) {
        if (!arg) return this;
        
        this.conditions.push(arg);
        return this.end(callback);
    }
    
    Search.prototype.end = function(callback) {
        if(!callback) return this;
        var self = this,
          params = {},
          urls = [];
        function process(arg) {
            if(typeof arg == 'number') {
                urls.push(self.uri(arg));
            } else if (Array.isArray(arg)) {
                urls = urls.concat(arg.map(function(id) {
                    return self.uri(id);
                }));
            } else if(arg === Object(arg)) {
                    Object.keys(arg).forEach(function(key) {
                        params[key] = arg[key];
                    });
                }
            }
        
        this.conditions.forEach(process);
        (urls.length == 0) && (urls = [ this.uri() ]);
        this._execute(urls, params, callback);
    };
    
    Search.prototype._execute = function(urls, params, callback) {
        var self = this, results = [];
        urls.forEach(function(url) {
            Client
            .get(url).data(params)
            .end(Client.parse(function(err, data) {
                if(err) throw err;
                results.push((self.model ? 
                    new self.model(data) : data));
        
                if(results.length == urls.length) {
                    callback((urls.length == 1 ?
                    results[0] : results));
                    }
            }));
        });
    };

    Search.prototype.each = function(callback) {
        return this.end(function(results) {
            results.forEach(callback);
        });
        
    return function(options) {
        return function(arg, callback) {
            return new Search(options).and(arg, callback);
        }
    };
};
    
});