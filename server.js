
var express = require('express')
  , config = require('./config')
  , routes = require('./routes')
  , auth = require('./auth')
  , http = require('http')
  , bundleUp = require('bundle-up')
  , logger = require('./logger')
  , Q = require('q')
  , path = require('path')
  , passport = require('passport')
  , MongoStore = require('connect-mongo')(express)
  , app = express()
  , server = http.createServer(app)
  , socketApp = require('./socketapp')
  , feedpush = require('./feedpush')
  , io = require('socket.io').listen(server)
  , download = require('./background/download')
  , sessionStore = new MongoStore({
                url: config.db.url + 'web/sessions',
                auto_reconnect : true
            });

// all environments
app.set('port', config.app.port);
app.set('ipaddress', config.app.ipaddress);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.favicon(__dirname + '/public/content/images/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ 
            secret : config.session.secret,
            store : sessionStore
        }));
app.use(passport.initialize());
app.use(passport.session());
app.use('/push', feedpush.handler());
app.use(app.router);

bundleUp(app, __dirname + '/assets', {
  staticRoot: __dirname + '/public/',
  staticUrlRoot:'/',
  bundle: false,
  minifyCss: true,
  minifyJs: true
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// screen routes
app.get('/', routes.index);
app.get('/fail', routes.fail);

auth.init(app, io, sessionStore);
socketApp.start(io);

// kick off background tasks
download.start();

server.listen(app.get('port'), app.get('ipaddress'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
