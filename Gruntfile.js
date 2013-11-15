module.exports = function (grunt) {
    'use strict';
    
    grunt.initConfig({
        clean : {
            build : {       
                src: ['dist/']
            },
            deploy : {
                src : [ 
                    'C://Users/mike/app/auth', 
                    'C://Users/mike/app/background', 
                    'C://Users/mike/app/data', 
                    'C://Users/mike/app/public', 
                    'C://Users/mike/app/routes', 
                    'C://Users/mike/app/views' 
                ],
                options : {
                    force : true
                }
            }
        },
        copy : {
            server : {
                files: [
                    {
                        src: ['*.js', 'auth/**/*.js', 'background/**/*.js', 'data/**/*.js', 'routes/**/*.js', 'views/**/*.jade', 'package.json', '!views/layout*.jade', '!Gruntfile.js', '!config*.js'],
                        expand : true,
                        dest : 'dist/'
                    },
                    { src: 'config.production.js', dest: 'dist/config.js' },
                    { src: 'views/layout.production.jade', dest: 'dist/views/layout.jade' },
                ]
            },
            client : {
                files : [
                    { src: ['public/content/fonts/*.*', 'public/content/images/*.*'], dest : 'dist/' },
                    { src : 'public/scripts/require/require.js', dest : 'dist/public/scripts/require.js' },
                ]
            },
            deploy : {
                files : [
                     { 
                        expand : true,
                        cwd : 'dist',
                        src : '**/*.*', 
                        dest : 'C://Users/mike/app/'
                     }     
                ]
            }
        },
        cssmin : {
            client : {
                src: 'public/content/css/*.css',
                dest : 'dist/public/content/css/style.css'
            }
        },
        durandal : {
            client : {
               src : [ 'public/app/**/*.*' ],
               options : {
                   baseUrl : 'public/app',
                   name: '../scripts/require/almond-custom',
                   mainPath : 'public/app/main',
                   out : 'dist/public/scripts/main.js',
                   mainConfigFile : 'public/app/main.js',
                   paths : {
                        'jquery': '../scripts/jquery/jquery-1.9.1',
                        'almond' : '../scripts/require/almond-custom.js',
                        'text': '../scripts/require/text',
                        'durandal': '../scripts/durandal/js',
                        'plugins': '../scripts/durandal/js/plugins',
                        'transitions': '../scripts/durandal/js/transitions',
                        'socket.io' : '../scripts/socket.io',
                        'config' : 'config.production'
                   },
                   //optimize : 'none',
                   wrap: false
               }
            }
        }
    });
    
    // required npm tasks
    grunt.loadNpmTasks('grunt-durandal');    
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    
    // build tasks
    grunt.registerTask('build-server', ['copy:server']);
    grunt.registerTask('build-client', ['copy:client', 'cssmin:client', 'durandal:client']);
    grunt.registerTask('default', ['clean:build', 'build-server', 'build-client']);
    
    // deploy tasks
    grunt.registerTask('deploy', ['clean:deploy', 'copy:deploy']);
};