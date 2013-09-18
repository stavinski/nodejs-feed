define(function () {
   
    // very simplistic uri parsing leveraging the anchor element, yeah I know
    var uri = function (uri) {
        var anchor = document.createElement('a');
        anchor.href = uri;
        
        return {
            host : anchor.host,
            hostname : anchor.hostname
        };
    };
    
    return uri;
});