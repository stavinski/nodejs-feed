
/**
 * Module dependencies.
 */

var express = require('express')
  , indexes = require('./db/indexes')
  , routes = require('./routes')
  , api = require('./api')
  , http = require('http')
  , bundleUp = require('bundle-up')
  , logger = require('./logger')
  , Q = require('q')
  , path = require('path');

var app = express();

// db indexes
indexes.ensureIndexes();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon(__dirname + '/public/content/images/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

bundleUp(app, __dirname + '/assets', {
  staticRoot: __dirname + '/public/',
  staticUrlRoot:'/',
  bundle: false,
  minifyCss: true,
  minifyJs: true
});

app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// screen routes
app.get('/', routes.index);

// api routes
app.get('/api/subscriptions/', api.subscriptions);
app.get('/api/subscriptions/:id', api.subscription);
app.post('/api/articles/:id', api.articleUpdate);
app.get('/api/articles/', api.articles);
app.get('/api/articles/:id', api.article);

// logger routes
app.get('/logger/:level', function (req, res) {
    var filter = {
        level : req.params.level
    };
    
    logger.query(filter)
        .then(function (results) { res.json(results); })
        .done();
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
