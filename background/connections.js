/* jshint node: true */
'use strict';

var   profiles = require('../data/profiles')
    , config = require('../config');

var execute = function() {
    var   now = new Date()
        , staleCheck = now.setHours(now.getHours() - config.background.connectionStaleHours);
    
    profiles.removeOldConnections(staleCheck)
        .fin(function () {
            setTimeout(execute, config.background.pollMs);    
        });
};

module.exports.start = function () {
    if (config.background.connectionCleanupActive)
        return execute();
    
    return;
};