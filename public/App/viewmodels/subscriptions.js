﻿define(['durandal/plugins/router', 'jquery', 'knockout', 'amplify'], function(router, $, ko, events) {
    
    var vm = {
        subscriptions: ko.observableArray([
        {
            title: 'Software Design',
            unread: 5,
            subscriptionId : 123,
            children: ko.observableArray([
                {
                    title: 'Udi Dahan',
                    unread: 2
                },
                {
                    title: 'SOA Patterns',
                    unread: 3
                }])
        }]),
        router : router,
        activate: function () 
        {  
            
        }
    };
    
    return vm;
});