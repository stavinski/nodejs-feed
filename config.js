
config = {};

config.app = {};
//config.app.ipaddress = process.env.OPENSHIFT_INTERNAL_IP || process.env.OPENSHIFT_NODEJS_IP || 127.0.0.1;
config.app.port = process.env.OPENSHIFT_INTERNAL_PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000;

config.db = {};
config.db.host = process.env.OPENSHIFT_MONGODB_DB_HOST || '192.168.0.16';
config.db.port = parseInt(process.env.OPENSHIFT_MONGODB_DB_PORT) || 27017;

config.profiles = {};
config.profiles.id = '51fcf8f50b4f238839000001';

config.logging = {};
config.logging.level = 'debug';

module.exports = config;