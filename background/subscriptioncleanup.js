var config = require('../config')
    , engine = require('tingodb')()
    , db = new engine.Db('./db/' , {})    
    , moment = require('moment')
    , subscriptions = db.collection('subscriptions')
    , articles = db.collection('articles')
    , profiles = db.collection('profiles')
    , logger = require('../logger')
    , indexes = require('../db/indexes');
    
var execute = function() {
    
    indexes.ensureIndexes();

	profiles.update({ _id: config.profiles.id }, { $set : { settings : { unreadCutOffDays : 20 } } });

    // staleness check
    profiles.findOne({ _id : config.profiles.id }, {settings:1}, function (err, profile) {
        if (err) {
            logger.error('subscriptioncleanup', err, 'raised while retrieving profile');
            return;
        }

	
            
        logger.debug('subscriptioncleanup', 'using unread cut off value of: ' + profile.settings.unreadCutOffDays);
        logger.debug('subscriptioncleanup', 'using read cut off value of: ' + profile.settings.readCutOffDays);
            
        subscriptions.find({ profile : profile._id }).each(function (err, subscription) {
            if (err) {
                logger.error('subscriptioncleanup', err, 'raised while finding subscriptions by profile');
                return;
            }
                                        
            if (subscription == null) return;
            
            var unreadCutOff = moment().subtract('days', profile.settings.unreadCutOffDays).toDate();
            var readCutOff = moment().subtract('days', profile.settings.readCutOffDays).toDate();
            
            // unread removal 
            articles.remove( {subscription : subscription._id, read: false, published : { $lt: unreadCutOff } },{w:1}, function (err, removed) {
                if (err) {
                    logger.error('subscriptioncleanup', err, 'raised while removing unread articles');
                    return;
                }
                logger.debug('subscriptioncleanup', 'removed ' + removed + ' unread articles');
            });

            // read removal           
            articles.remove( {subscription : subscription._id, read: true, published : { $lt: readCutOff } },{w:1}, function (err, removed) {
                if (err) {
                    logger.error('subscriptioncleanup', err, 'raised while removing read articles');
                    return;
                }
                logger.debug('subscriptioncleanup', 'removed ' + removed + ' read articles');
            });
        });
    });
    
    // tidy up any unreads that have gone out of sync
    subscriptions.find({ profile: config.profiles.id }).each(function (err, subscription) {
        if (err) {
            logger.error('subscriptioncleanup', err, 'raised while retrieving subscriptions');
            return;
        }
        
        if (subscription == null) return;
    
        articles.count({ subscription : subscription._id, read: false }, function (err, count) {
            if (err) {
                logger.error('subscriptioncleanup', err, 'raised while retrieving unread article count');
                return;
            }
            subscriptions.update({ _id : subscription._id }, { $set: { unread : count } }); 
        });
    });
    
};

execute();
