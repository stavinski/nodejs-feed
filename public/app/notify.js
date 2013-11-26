define(['config'], function (config) {
            
    var error = function (src, msg, title) {
        if (config.debug)
            console.log('error raised, source: ' + src + 'message: ' + msg);
        
        Stashy.Notify({
            title : title || '',
            content : msg,
            style : 'error',
            closeArea: 'element',
            activeDuration : 5000
        }).bar('top');
    }
    
    var success = function (msg, title) {
        Stashy.Notify({
            title : title || '',
            content : msg,
            style : 'success',
            closeArea: 'element',
            activeDuration : 5000
        }).bar('top');
    };
    
    return {
        error : error,
        success : success
    }
    
});