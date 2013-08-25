
exports.index = function(req, res){
    var params = {
        title : 'push feed'
    };
    params.signedIn = (typeof req.user !== 'undefined');
    res.render('index', params);
};