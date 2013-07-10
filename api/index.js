var   subscriptions = require('./subscriptions')
    , articles = require('./articles');
    
exports.subscriptions = subscriptions.getSubscriptions;
exports.subscription = subscriptions.getSubscription;
exports.articles = articles.getArticles;
exports.article = articles.getArticle;
exports.articleRead = articles.read;    