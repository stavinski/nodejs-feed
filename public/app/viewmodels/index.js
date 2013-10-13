define(['fastclick'], function (fastclick) {
       
    var ViewModel = {
        activate : function () {
            
        },
        attached : function () {
            fastclick.attach(document.body);
            $('.ui-pivot').metroPivot();
        },
        navItems : [
            { hash : '/#/add', icon : 'icon-plus' },
            { hash : '/#/admin', icon : 'icon-cogs' }
        ]
    };
    
    return ViewModel;
});