define(['config'], function (config) {
    
    var facebook = function (details) {
        var url = 'https://www.facebook.com/sharer/sharer.php?et=' + details.title +
            '&u=' + details.link;
        
        return url;
    };
    
    var twitter = function (details) {
        var url = 'https://twitter.com/intent/tweet?original_referer=' + config.baseUri +
            '&related=pushfeednet' +
            '&text=' + details.title +
            '&url=' + details.link +
            '&via=pushfeednet';
        return url;
    };
    
    return {
        facebook : facebook,
        twitter : twitter
    }
    
});