var   opml = require('./opml')
    , fs = require('fs')
    , config = require('./config')
    , mongodb = require('mongodb')
    , ObjectID = require('mongodb').ObjectID
    , dbServer = new mongodb.Server(config.db.host, config.db.port)
    , db = new mongodb.Db('pushfeed', dbServer, {w:1})
    , Q = require('q');
    
var execute = function () {
    
    /*
    fs.readFile(__dirname + '/subscriptions.xml', { encoding: 'utf-8' }, function (err, data) {
        if (err) { console.log(err); }
        
        opml.parse(data, function (err, feeds) {
            if (err) { console.log(err); }
            
            Q.ninvoke(db, 'open')
                .then(function () {
                    var subscriptions = db.collection('subscriptions');
                    
                    for (var i=0; i < feeds.length; i++) {
                        var subscription = {
                            profile: new ObjectID("51fcf8f50b4f238839000001"),
                            title : feeds[i].title,
                            xmlurl : feeds[i].xmlurl,
                            htmlurl : feeds[i].htmlurl,
                            lastModified: '',
                            etag: ''
                        };
                        subscriptions.insert(subscription);
                        //console.log('going insert' + subscription);
                    }
                })
                .fin(function () { db.close(); })
                .done();
            
            
        });
    });
    */
};

execute();