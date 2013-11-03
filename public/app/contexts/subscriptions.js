define(['connection', 'cache', 'knockout', 'knockoutmapping'], function (connection, cache, ko, mapping) {
        
    var sortSubscriptions = function (prev, next) {
        return prev.stitle - next.stitle;
    };
    
    var context = {
        _cachePrefix : 'subscriptions',
        _init : false,
        _getCache : function () {
            // null function pattern ?
            return cache.get(this._cachePrefix)
                    || { timestamp : new Date(0), subscriptions : [] };
        },
        _setCache : function () {
            var data = {
                timestamp : new Date(),
                subscriptions : this.subscriptions()
            };
            cache.set(this._cachePrefix, data);
        },
        _sync : function () {
            var   self = this
                , cached = self._getCache();
            
            self.loading(true);
            connection.send('backend.syncsubscriptions', { since : cached.timestamp }, function (data) {
                self.loading(false);
                if (data.status == 'success') {
                    var underlyingArray = self.subscriptions();
                    data.subscriptions.forEach(function (newSubscription) {
                        underlyingArray.push(newSubscription);
                    });
                    underlyingArray.sort(sortSubscriptions);
                    self.subscriptions.valueHasMutated();
                    self._setCache();
                } else {
                    // inform user we are only have local cached subscriptions available for browsing
                }
            });
        },
        init : function () {
            var self = this;
            
            if (self._init) return; // just in case it calls again
            self._init = true;
            var cached = self._getCache();
            var underlyingArray = self.subscriptions();
            
            if (cached.subscriptions) {            
                cached.subscriptions.forEach(function (subscription) {
                    underlyingArray.push(subscription);
                });
                underlyingArray.sort(sortSubscriptions);
            }
            
            self._sync();        
        },
        subscribe : function (url, category, callback) {
            var   self = this
                , additional = { category : category };
            
            connection.send('backend.addsubscription', { url : url, additional : additional }, function (data) {
                if (data.status == 'success') {
                    self.subscriptions.push(data.subscription);
                    self.subscriptions.sort(sortSubscriptions);
                    self.subscriptions.valueHasMutated();
                    self._setCache();
                    callback({ added : true, subscription : data.subscription }); 
                } else {
                    callback({ added : false, reason : data.reason }); 
                }
            });
        },
        unsubscribe : function (id, callback) {
            var self = this;
            
            connection.send('backend.unsubscribe', { id : id }, function (data) {
                if (data.status == 'success') {
                    self.subscriptions.remove(function (subscription) {
                        return subscription._id == id;    
                    });
                    self.subscriptions.sort(sortSubscriptions);
                    self.subscriptions.valueHasMutated();
                    self._setCache();    
                    callback({ removed : true }); 
                } else {
                    callback({ removed : false, reason : data.reason }); 
                }
            });
        },
        update : function (meta, callback) {
            var self = this;
            connection.send('backend.updatesubscription', { meta : meta }, function (data) {
                if (data.status == 'success') {
                    var subscription = ko.utils.arrayFirst(self.subscriptions(), function (subscription) {
                        return (subscription._id === meta.subscription);
                    });
                    
                    if (meta.category)
                        subscription.category = meta.category;
                    
                    self.subscriptions.valueHasMutated();
                    self._setCache();    
                    callback({ updated : true }); 
                } else {
                    callback({ updated : false }); 
                }
            });
        },
        loading : ko.observable(false),
        subscriptions : ko.betterObservableArray(),
    };
    
    context.categories = ko.computed(function () {
            // categories are linked to subscriptions
            var   self = this
                , allCategories = ko.utils.arrayMap(self.subscriptions(), function (subscription) {
                    return subscription.category;    
                });
            
            return ko.utils.arrayGetDistinctValues(allCategories)
                            .sort();
        }, context);
    
    return context;
});