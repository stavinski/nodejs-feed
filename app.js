
/**
 * Module dependencies.
 */

var express = require('express')
  , config = require('./config')
  , indexes = require('./db/indexes')
  , routes = require('./routes')
  , authentication = require('./authentication')
  , api = require('./api')
  , http = require('http')
  , bundleUp = require('bundle-up')
  , logger = require('./logger')
  , Q = require('q')
  , path = require('path')
  , passport = require('passport')
  , MongoStore = require('connect-mongo')(express);

var app = express();

// db indexes
indexes.ensureIndexes();

// all environments
app.set('port', config.app.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon(__dirname + '/public/content/images/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({ 
            secret : '@>i5[3q@Xs+*/X9',
            store : new MongoStore({
                db: 'web',
                host: config.db.host,
                port: config.db.port
            })
        }));
app.use(passport.initialize());
app.use(passport.session());
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

authentication.initialize(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
