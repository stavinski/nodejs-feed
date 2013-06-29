requirejs.config({
    paths: {
        'text': 'durandal/amd/text',
        'jquery' : '../scripts/jquery-1.9.1',
        'knockout' : '../scripts/knockout-2.2.1',
        'amplify' : '../scripts/amplify'
    },
    shim: {
        'amplify': {
            deps: ['jquery'],
            exports: 'amplify'
        }
    }
});

define(['durandal/app', 'durandal/viewLocator', 'durandal/system', 'durandal/plugins/router'],
    function(app, viewLocator, system, router) {

        //>>excludeStart("build", true);
        system.debug(true);
        //>>excludeEnd("build");

        app.title = 'feed reader';
        app.start().then(function() {
            //Replace 'viewmodels' in the moduleId with 'views' to locate the view.
            //Look for partial views in a 'views' folder in the root.
            viewLocator.useConvention();

            //configure routing
            router.useConvention();
            router.mapNav('dashboard');
            router.mapNav('dashboard/:filter');
            router.mapNav('admin');
            
            //app.adaptToDevice();

            //Show the app by setting the root view model for our application with a transition.
            app.setRoot('viewmodels/shell', 'entrance');
        });
    });