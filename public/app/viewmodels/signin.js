define(['fastclick'], function (fastclick) {
    
    var ViewModel = {
        activate : function () {
        },
        attached : function () {
            fastclick.attach(document.body);
        }
    }
    
    return ViewModel;
    
});