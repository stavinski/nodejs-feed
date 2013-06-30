(function() {
    ko.bindingHandlers.date = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            
        },
        update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var val = valueAccessor().toDateString();
            var observable = ko.observable(val);
            ko.bindingHandlers.text.update(element, observable);
        }
    };
    
}());