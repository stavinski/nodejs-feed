module.exports = function(assets) {
    assets.root = __dirname;
    assets.addJs('/public/scripts/jquery-1.9.1.js');
    assets.addJs('/public/scripts/jquery.ui.core.js');
    assets.addJs('/public/scripts/bootstrap.js');
    assets.addJs('/public/scripts/knockout-2.2.1.js');
    assets.addJs('/public/scripts/sammy-0.7.4.js');
    assets.addJs('/public/scripts/jquery.jstree.js');
    assets.addJs('/public/scripts/amplify.js');
    assets.addJs('/public/scripts/toastr.js');
    assets.addJs('/public/scripts/bindings/date.js');
    //assets.addJs('/public/scripts/arboreal.js');
    assets.addCss('/public/content/css/*.css');
};