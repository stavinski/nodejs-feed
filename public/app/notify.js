define(['config'], function (config) {
            
    var error = function (src, msg, title) {
        if (config.debug)
            console.log('error raised, source: ' + src + 'message: ' + msg);
        
        Stashy.Notify({
            title : title || '',
            content : msg,
            style : 'error'
        }).bar('top');
    }
    
    var success = function (msg, title) {
        Stashy.Notify({
            title : title || '',
            content : msg,
            style : 'success'
        }).bar('top');
    };
    
    return {
        error : error,
        success : success
    }
    
});