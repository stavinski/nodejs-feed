
exports.index = function(req, res){
    var params = {
        title : 'pushfeed'
    };
    params.signedIn = (typeof req.user !== 'undefined');
    res.render('index', params);
};