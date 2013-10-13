define(['durandal/composition'], function (composition) {
    
    var ViewModel = function () {};
    
    ViewModel.prototype.activate = function (settings) {
        this.settings = settings;
    };
        
    return ViewModel;
});