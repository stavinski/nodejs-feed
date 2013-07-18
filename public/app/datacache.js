define(['./config'], function (config) {
    
    var Cache = {
        _data : {},
        
        has : function (key) {
            return this._data.hasOwnProperty(key);
        },
        get : function (key) {
            if (this._data[key]) {
                if (config.debug) console.log('cache hit with key: [' + key + ']');
                
                return this._data[key];
            }
            if (config.debug) console.log('cache miss with key: [' + key + ']');
            
            return null;
        },
        set : function (key, val) {
            this._data[key] = val;
        }
    };
    
    return Cache;

});