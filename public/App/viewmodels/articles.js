define(function() {
    var html = '<p>Given the overwhelming feedback to revive the “Ask Udi” podcast, how could I refuse.</p><p>Please submit your questions over here or vote on questions that other people have asked.</p><p>Even if you dont have a specific question, please feel free to suggest a topic that youd like me to rant about (CQRS for example).</p><p>The podcast used to be supported by an online magazine and I didnt think to back up the old podcast episodes so some have been lost in the ether, but you can find some of the history here: http://www.udidahan.com/category/ask-udi-podcast/.</p><p>Lets see if we can get a podcast out by the end of next week – so go and suggest the topics you want to here about:</p>';
    
    var vm = {
        articles: ko.observableArray([
            {
                title: 'The "Ask Udi" podcast is back',
                date: new Date(),
                content: html,
                url: 'http://feedproxy.google.com/~r/UdiDahan-TheSoftwareSimplist/~3/9Qkgu4YheHg/'
        }]),
        activate: function() {}
    };
    
    return vm;
});