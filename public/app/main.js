requirejs.config({
    paths: {
        'text': '../scripts/require/text',
        'durandal':'../scripts/durandal/js',
        'plugins' : '../scripts/durandal/js/plugins',
        'transitions' : '../scripts/durandal/js/transitions',
        'knockout': '../scripts/knockout/knockout-2.3.0',
        'knockoutmapping' : '../scripts/knockout/knockout.mapping',
        'knockoutbetterobservablearray' : '../scripts/knockout/knockout.betterobservablearray',
        'bootstrap': '../scripts/bootstrap/js/bootstrap.min',
        'jquery': '../scripts/jquery/jquery-1.9.1.min',
        'jquery.ui' : '../scripts/jquery/jquery-ui-1.9.2.custom.min',
        'amplify' : '../scripts/amplify',
        'Q' : '../scripts/q',
        'moment' : '../scripts/moment',
        'socket.io' : '/socket.io/socket.io',
        'toastr' : '../scripts/toastr',
        'moment' : '../scripts/moment',
        'fastclick' : '../scripts/fastclick',
        'jquery.lazy' : '../scripts/jquery/jquery.lazy.min',
        'jquery.pivot' : '../scripts/jquery/jquery.pivot',
        'jquery.hammer' : '../scripts/jquery/jquery.hammer.min',
        'hammer' : '../scripts/hammer.min'
    },
    shim: {
        'bootstrap': {
            deps: ['jquery'],
            exports: 'jQuery'
        },
        'amplify': {
            deps: ['jquery'],
            exports: 'amplify'
        },
        'knockoutmapping' : {
            deps: ['knockout']
        },
        'knockoutbetterobservablearray' : {
            deps: ['knockout']
        },
        'jquery.lazy' : {
            deps : ['jquery']    
        },
        'jquery.pivot' : {
            deps : ['jquery', 'jquery.ui', 'jquery.hammer']    
        },
        'jquery.ui' : {
            deps : ['jquery']    
        },
        'jquery.hammer' : {
            deps : ['jquery', 'hammer']
        }
    }
});

// load require js libraries
require(['bootstrap'], function() {});
require(['knockout'], function(ko){ window.ko = ko; });
require(['knockoutbetterobservablearray'], function() {});
require(['jquery.pivot'], function() {});

define(['durandal/app', 'durandal/viewLocator', 'durandal/system', 'plugins/router'],
    function(app, viewLocator, system, router) {

        //>>excludeStart("build", true);
        system.debug(true);
        //>>excludeEnd("build");

        app.title = 'pushfeed.net';
        
        app.configurePlugins({
            router: true,
            dialog: true,
            widget: {
                kinds : ['navbar']    
            }
        });
        
        app.start().then(function() {
            //Replace 'viewmodels' in the moduleId with 'views' to locate the view.
            //Look for partial views in a 'views' folder in the root.
            viewLocator.useConvention();
            
            app.setRoot('viewmodels/shell');
        });
    });