define(['knockout', 'connection'], function (ko, connection) {
       
    var ViewModel = {
        activate : function () {
        },
        feedUrl : ko.observable(''),
        addFeed : function () {
            connection.send('backend.addfeed', { url : this.feedUrl() }, function (result) {
                console.log(result);
            }); 
        },
        saveCache : function () {
            
        }
    };
    
    return ViewModel;
});