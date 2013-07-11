
/**
 * Module dependencies.
 */

var express = require('express')
  , startup = require('./startup')
  , routes = require('./routes')
  , api = require('./api')
  , http = require('http')
  , bundleUp = require('bundle-up')
  , path = require('path');

var app = express();

// startup
startup.execute();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

bundleUp(app, __dirname + '/assets', {
  staticRoot: __dirname + '/public/',
  staticUrlRoot:'/',
  bundle: false,
  minifyCss: false,
  minifyJs: false
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
app.post('/api/articles/read/:id', api.articleRead);
app.get('/api/articles/', api.articles);
app.get('/api/articles/:id', api.article);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
