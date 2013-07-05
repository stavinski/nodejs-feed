var config = require('./config')
    , engine = require('tingodb')()
    , db = new engine.Db( config.db.path , {})    
    , coll = db.collection('profiles');

exports.subscriptions = function(req, res){
    var doc = coll.findOne({ username: 'stavinski' }, function (err, doc) {
        res.json(doc);
        res.end();
    });
    
};