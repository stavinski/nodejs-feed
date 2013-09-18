define(['knockout', 'config', 'jquery'], function (ko, config, $) {
    
    var mapResult = function (result) {
        var anchor = document.createElement('a');
        anchor.href = result.link;
        result.domain = anchor.host;
        
        return result;
    };
    
    ViewModel = {
        activate : function () {
            
        },
        query : ko.observable(''),
        results : ko.observableArray(),
        search : function (limit) {
            var   self = this
                , searchUrl = 'https://ajax.googleapis.com/ajax/services/feed/find?v=1.0&callback=?';
            
            if (self.query().length > 0) {
                $.getJSON(searchUrl, { q : self.query() })
                .fail(function (err) { console.log('alert here'); })
                .always(function () { console.log('loading notification here'); })
                .done(function (data) {
                    if (data.responseStatus == 200) {
                        var mapped = data.responseData.entries.map(mapResult);
                        console.log(mapped);
                        self.results(mapped);    
                        
                    } else {
                        console.log('alert here')   
                    }
                                        
                });
            } else {
                alert('not entered value!');
            }        
        }
    };
    
    
    return ViewModel;
    
});
