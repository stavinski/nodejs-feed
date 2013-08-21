module.exports = function(assets) {
    assets.root = __dirname;
    assets.addCss('/public/content/css/*.css');
    // only css as js is loaded via requirejs
};