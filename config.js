
config = {};

config.app = {};
config.app.ipaddress = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
config.app.port = process.env.OPENSHIFT_NODEJS_PORT || 3000;
config.app.baseUrl = 'http://localhost:3000/';

config.db = {};
config.db.url = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://mongodb:27017/';
config.db.host = process.env.OPENSHIFT_MONGODB_DB_HOST || 'mongodb';
config.db.port = parseInt(process.env.OPENSHIFT_MONGODB_DB_PORT) || 27017;

config.profiles = {};
config.profiles.id = '51fcf8f50b4f238839000001';

config.logging = {};
config.logging.level = 'debug';

config.session = {};
config.session.key = 'connect.sid';
config.session.secret = '@>i5[3q@Xs+*/X9';

config.socketio = {};
config.socketio.loglevel = 1;
config.socketio.minify = false;

config.background = {};
config.background.pollMs = 30000;
config.background.subscriptionPollMins = 10;

config.feedpush = {};
config.feedpush.leaseSeconds = 7 * 24 * 60 * 60; // a week


module.exports = config;