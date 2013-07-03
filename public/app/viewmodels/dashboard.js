define(['datacontext'], function(datacontext) {
    
    var vm = {
        activate: function () 
        { 
            // tell the datacontxt to fill the summary data
            // returns a promise to durandal
            return datacontext.populateSummaryData();
        }
    };
    
    return vm;
});