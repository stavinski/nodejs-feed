var   op = require('opmlparser')
    , fs = require('fs')
    , StringReader = require('./stringreader')

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
    }
};

module.exports = opmlParser;