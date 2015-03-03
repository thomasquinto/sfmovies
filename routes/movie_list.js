var express = require('express');
var router = express.Router();

/* GET movie_list page. */
router.get('/movie_list', function(req, res) {
    var db = req.db;
    var collection = db.get('movie_locations');
    collection.find({}, {}, function(e, docs){
        res.render('movie_list', {
            'title' : 'SF Movie Map',
            'movies' : docs,
        });
    });
});

module.exports = router;
