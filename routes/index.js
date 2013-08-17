
/*
 * GET home page.
 */

exports.index = function(req, res){
    console.log(req.user);
    var params = {
        title : 'push feed'
    };
    params.signedIn = (typeof req.user !== 'undefined');
    res.render('index', params);
};