define(['cache', 'knockout'], function (cache, ko) {
    
    var cacheKey = 'subscriptions';
            
    var sortSubscriptions = function (prev, next) {
        return prev.stitle - next.stitle;  
    };
    
    var SubscriptionMediator = {
        _init : function () {
            this.subscriptionsBinding(this._get());    
        },
        _get : function () {
            var current = cache.get(cacheKey);
            if (current)
                return current.subscriptions || [];
            
            return [];
        },
        remove : function (data) {
            // remove from cache
            var   current = this._get()
                , filteredSubscriptions = current.filter(function (subscription) {
                    return subscription._id != data.subscription._id;
                });
            
            this.subscriptionsBinding(filteredSubscriptions);
            cache.set(cacheKey, { timestamp : data.timestamp, subscriptions : filteredSubscriptions });      
        },
        add : function (data) {
            var   currentSubscriptions = this._get()
                , doesNotExist = currentSubscriptions.every(function (subscription) {
                                    return subscription._id != data.subscription._id;    
                                });
            
            if (doesNotExist) {
                currentSubscriptions.push(data.subscription);
                this.subscriptionsBinding.push(data.subscription);
                currentSubscriptions.sort(sortSubscriptions);
                cache.set(cacheKey, { timestamp : data.timestamp, subscriptions : currentSubscriptions });         
            }            
        },
        lastDownload : function () {
            var current = cache.get(cacheKey);
            if (current)
                return current.timestamp || new Date(0);
            
            return new Date(0);
        },
        addMultiple : function (data) {
            var   timestamp = data.timestamp
                , self = this;
            data.subscriptions.forEach(function (subscription) {
                self.add({ timestamp : timestamp, subscription : subscription });
            });
        },
        subscriptionsBinding : ko.observableArray([])
    };
    
    SubscriptionMediator._init();
    return SubscriptionMediator;
});