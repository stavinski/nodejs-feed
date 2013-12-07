/* jshint node: true */
'use strict';

var   uuid = require('uuid')
    , tokens = {}
    , TIMEOUT_MS = 600000; // 10mins

var verifyTokens =  {
    verify : function (token) {
        if (tokens[token]) {
            delete tokens[token];
            return true;    
        }
        
        return false;
    },
    create : function (topic) {
        var   id = uuid.v4();
                
        tokens[id] = topic;
        setTimeout(function () {
            delete tokens[id];
        }, TIMEOUT_MS);
        
        return id;
    },
    clear : function () {
        tokens = {};       
    }
};

module.exports = {
    verify : verifyTokens.verify,
    create : verifyTokens.create,
    clear : verifyTokens.clear,
    TIMEOUT_MS : TIMEOUT_MS
};
