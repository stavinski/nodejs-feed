define(['amplify'], function (amplify) {
    
    var Cache = {
        _cachePrefix : 'pushfeed:',
        get : function (key) {
            return amplify.store(this._cachePrefix + key);
        },
        set : function (key, val, expires) {
            if (expires) {
                amplify.store(this._cachePrefix  + key, val, expires);    
            } else {
                amplify.store(this._cachePrefix  + key, val);
            }
        },
        clearAll : function () {
            for (var key in amplify.store()) {
                if (key.indexOf(this._cachePrefix) == 0)
                    amplify.store(key, null);
            }                
        }
    };
    
    return Cache;

});