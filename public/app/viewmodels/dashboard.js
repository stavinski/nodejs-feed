define(['filters'], function(filters) {
    
    var vm = {
        activate: function (splat) 
        { 
            filters.applied = splat.filter;
            filters.subscription = splat.id;
        }
    };
    
    return vm;
});