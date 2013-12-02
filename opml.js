/* jshint node: true */
'use strict';

var   op = require('opmlparser')
    , xml = require('xml')
    , fs = require('fs')
    , StringReader = require('./stringreader');

var opmlParser = {
    parse : function (data, cb) {
        var   sr = new StringReader(data)
            , feeds = [];
        
        sr.pipe(new op())
            .on('feed', function (feed){
                feeds.push(feed);
            })
            .on('error', function (err) {
                cb(err, null);
            })
            .on('end', function ()
            {
                cb(null, feeds);
            });
            
        sr.resume();
    },
    write : function (data) {
        // based off the opml export format from google reader, rip :(
                
        var mapCategories = function (category) {
            var returnValue = {
                outline : data.subscriptions
                              .filter(function (subscription) {
                                  return (subscription.category === category);
                              })
                              .map(mapSubscriptions)
            };
            
            // add the attributes
            returnValue.outline.push({ 
                _attr : {
                    title : category,
                    text : category
                }
            });
            
            return returnValue;
        };
        
        var mapSubscriptions = function (subscription) {
            return {
                outline : {
                  _attr : {
                        type : 'rss',
                        text : subscription.title,
                        title : subscription.title,
                        xmlUrl : subscription.xmlurl,
                        htmlUrl : subscription.htmlurl
                    }  
                }            
            };
        };
                
        var content = {
            opml : [{
                    _attr : {
                        version : '1.0'   
                    }
                },
                {
                    head: [{title : 'subscriptions from pushfeed'}],
                },
                {
                    body : data.categories.map(mapCategories)
                }
            ]
        };
        return xml(content, {indent: '\t'});
    }
};

module.exports = opmlParser;