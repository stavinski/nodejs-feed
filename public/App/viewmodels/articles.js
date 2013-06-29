define(['amplify'], function(events) {
    var html = '<p>Given the overwhelming feedback to revive the “Ask Udi” podcast, how could I refuse.</p><p>Please submit your questions over here or vote on questions that other people have asked.</p><p>Even if you dont have a specific question, please feel free to suggest a topic that youd like me to rant about (CQRS for example).</p><p>The podcast used to be supported by an online magazine and I didnt think to back up the old podcast episodes so some have been lost in the ether, but you can find some of the history here: <a href="http://www.udidahan.com/category/ask-udi-podcast/">http://www.udidahan.com/category/ask-udi-podcast/</a>.</p><p>Lets see if we can get a podcast out by the end of next week – so go and suggest the topics you want to here about:</p>';
    
    var vm = {
        articles: ko.observableArray([
            {
                title: 'The "Ask Udi" podcast is back',
                published: new Date(),
                source: 'Udi Dahan',
                content: html,
                url: 'http://feedproxy.google.com/~r/UdiDahan-TheSoftwareSimplist/~3/9Qkgu4YheHg/',
				collapsed: ko.observable(false),
                read: ko.observable(true),
				headerClicked: function (el) {
					this.collapsed(!el.collapsed())
				},
                starToggle : function () { console.log('star toggled');}
            },
            {
                title: 'RavenDB 2.5: What is new here?',
                published: new Date(),
                read: ko.observable(false),
                source: 'Ayende @ Rahien',
                content: 'Well, this is still just a high level list only, but there is a lot of stuff there. In many cases, I posted full blog entries about each new feature, but I’ll post a few words about those that I didn’t.',
                url: 'http://feedproxy.google.com/~r/AyendeRahien/~3/eWWBIFuZdJo/ravendb-2-5-what-is-new-here',
				collapsed: ko.observable(false),
				headerClicked: function (el) {
					this.collapsed(!el.collapsed())
				},
                starToggle : function () { console.log('star toggled');}
        }]),
		filter: ko.observable('all'),
        refresh: function() { console.log('refresh'); },
        activate: function() {
			var self = this;
			events.subscribe('filter-changed', function (msg) {
				self.filter(msg.filter);
			});
		}
    };
    
    return vm;
});