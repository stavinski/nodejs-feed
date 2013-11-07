define(['fastclick'], function (fastclick) {
       
    var ViewModel = {
        activate : function () {
            
        },
        attached : function () {
            fastclick.attach(document.body);
        },
        navItems : [
            { hash : '/#/add', icon : 'icon-plus', text: 'add' },    
            { hash : '/#/admin', icon : 'icon-cog', text: 'settings' }
        ]
    };
    
    return ViewModel;
});