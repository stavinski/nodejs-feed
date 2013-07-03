define(['config','logger'], function(config, logger) {
    
    var subscriptions = [];
        
    var populateSummaryData = function() {
        var retrievalSuccess = function(data) {
            logger.log(data.length, data, '', true);
        };
        
        var retrievalFailure = function(err) {
            logger.logError('Failed to retrieve summary data', err, '', true); 
        };
                    
        return $.getJSON(config.apiBaseUrl + 'subscriptions/')
                .done(retrievalSuccess)
                .fail(retrievalFailure);
    };
    
    return {
        subscriptions : subscriptions,
        populateSummaryData : populateSummaryData
    };
                    
});