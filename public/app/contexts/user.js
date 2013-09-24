define(function () {
    var context = {
        details : null,
        signIn : function (details) {
            this.details = details;
            this.isSignedIn = true;
        },
        isSignedIn : false
    };
    
    return context;
});