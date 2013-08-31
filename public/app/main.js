requirejs.config({
    paths: {
        'text': '../scripts/require/text',
        'durandal':'../scripts/durandal/js',
        'plugins' : '../scripts/durandal/js/plugins',
        'transitions' : '../scripts/durandal/js/transitions',
        'knockout': '../scripts/knockout/knockout-2.3.0',
        'bootstrap': '../scripts/bootstrap/js/bootstrap',
        'jquery': '../scripts/jquery/jquery-1.9.1',
        'amplify' : '../scripts/amplify',
        'Q' : '../scripts/q',
        'moment' : '../scripts/moment',
        'socket.io' : '/socket.io/socket.io',
        'toastr' : '../scripts/toastr'
    },
    shim: {
        'bootstrap': {
            deps: ['jquery'],
            exports: 'jQuery'
        },
        'amplify': {
            deps: ['jquery'],
            exports: 'amplify'
        }
    }
});

define(['durandal/app', 'durandal/viewLocator', 'durandal/system', 'plugins/router'],
    function(app, viewLocator, system, router) {

        //>>excludeStart("build", true);
        system.debug(true);
        //>>excludeEnd("build");

        app.title = 'pushfeed.net';
        
        app.configurePlugins({
            router:true,
            dialog: true,
            widget: true
        });
        
        app.start().then(function() {
            //Replace 'viewmodels' in the moduleId with 'views' to locate the view.
            //Look for partial views in a 'views' folder in the root.
            viewLocator.useConvention();
            
            app.setRoot('viewmodels/shell');
        });
    });