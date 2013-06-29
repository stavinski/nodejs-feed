define(function() {
    return {
        getAll : function() {
            return [
                {
                    title: 'Software Design',
                    unread: ko.observable('5'),
                    subscriptionId : 123,
                    folder: true,
                    children: ko.observableArray([
                        {
                            title: 'Udi Dahan',
                            unread: ko.observable('3'),
                            folder: false,
                        },
                        {
                            title: 'SOA Patterns',
                            unread: ko.observable('2'),
                            folder: false,
                        },
                        {
                            title: 'Ayende @ Rahien',
                            unread: ko.observable(''),
                            folder: false,
                        },
                        {
                            title: 'Elegant Code',
                            unread: ko.observable(''),
                            folder: false,
                        }])
                },
                {
                    title: 'Charlie Brooker',
                    unread: ko.observable(''),
                    subscriptionId : 123,
                    folder: false,
                    children: ko.observableArray()
                }                
            ]
        }
    };
        
});