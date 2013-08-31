define(['amplify'], function (amplify) {
    
    var Cache = {
        _cachePrefix : 'pushfeed:',
        get : function (key) {
            return amplify.store(this._cachePrefix + key);
        },
        set : function (key, val) {
            amplify.store(this._cachePrefix  + key, val);
        }
    };
    
    return Cache;

});