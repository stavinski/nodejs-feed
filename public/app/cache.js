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
        }
    };
    
    return Cache;

});