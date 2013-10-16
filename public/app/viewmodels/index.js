define(['fastclick'], function (fastclick) {
       
    var ViewModel = {
        activate : function () {
            
        },
        attached : function () {
            fastclick.attach(document.body);
            $('.ui-pivot').metroPivot();
            
            $(".navicon-button").click(function(){
                alert('asdasd');
                $(this).toggleClass("open");
                $(".cat-menu").toggleClass("open");
            });
        },
        navItems : [
            { hash : '/#/add', icon : 'icon-plus', text: 'add' },
            { hash : '/#/admin', icon : 'icon-cog', text: 'settings' }
        ]
    };
    
    return ViewModel;
});