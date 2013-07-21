(function() {
    ko.bindingHandlers.date = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            
        },
        update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var val = moment(valueAccessor());
            var observable = ko.observable(val.fromNow());
            ko.bindingHandlers.text.update(element, observable);
        }
    };
    
}());