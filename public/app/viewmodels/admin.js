define(['knockout', 'connection', 'amplify'], function (ko, connection, amplify) {
       
    var ViewModel = {
        activate : function () {
        },
        feedUrl : ko.observable(''),
        articleDetailsCache : ko.observable(''),
        addFeed : function () {
            connection.send('backend.addfeed', { url : this.feedUrl() }, function (result) {
                console.log(result);
                if (result.status == 'success') {
                    amplify.publish('subscriptionadded');
                }
            }); 
        },
        saveCache : function () {
            
        }
        
    };
    
    return ViewModel;
});