requirejs.config({
    "paths" : {
        "text": "../scripts/require/text",
        "durandal":"../scripts/durandal/js",
        "plugins" : "../scripts/durandal/js/plugins",
        'knockout' : '../scripts/knockout/knockout-3.0.0',
        "knockoutmapping" : "../scripts/knockout/knockout.mapping",
        "knockoutbetterobservablearray" : "../scripts/knockout/knockout.betterobservablearray",
        "bootstrap": "../scripts/bootstrap/js/bootstrap",
        "jquery": "../scripts/jquery/jquery-1.9.1.min",
        "jquery.ui" : "../scripts/jquery/jquery-ui-1.9.2.custom.min",
        "amplify" : "../scripts/amplify",
        "Q" : "../scripts/q",
        "moment" : "../scripts/moment",
        "socket.io" : "/socket.io/socket.io",
        "fastclick" : "../scripts/fastclick",
        "jquery.lazy" : "../scripts/jquery/jquery.lazy.min",
        "jquery.hammer" : "../scripts/jquery/jquery.hammer.min",
        "hammer" : "../scripts/hammer.min",
        "stashy" : "../scripts/stashy"
    },
    "shim" : {
        "bootstrap": {
            deps: ["jquery"],
            exports: "jQuery"
        },
        "amplify": {
            deps: ["jquery"],
            exports: "amplify"
        },
        "knockoutmapping" : {
            deps: ["knockout"]
        },
        "knockoutbetterobservablearray" : {
            deps: ["knockout"]
        },
        "jquery.lazy" : {
            deps : ["jquery"]    
        },
        "jquery.ui" : {
            deps : ["jquery"]    
        },
        "jquery.hammer" : {
            deps : ["jquery", "hammer"]
        },
        "stashy" : {
            deps: ["jquery.hammer"]   
        }
    }
});

// load require js libraries
require(['bootstrap'], function() {});
require(['knockoutbetterobservablearray'], function() {});
require(['stashy'], function() {});

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
    