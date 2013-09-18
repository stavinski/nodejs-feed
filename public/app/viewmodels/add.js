define(['knockout', 'config', 'jquery', 'uri'], function (ko, config, $, uri) {
    
    var mapResult = function (result) {
        result.domain = uri(result.link).host;
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
