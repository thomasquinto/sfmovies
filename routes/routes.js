var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'SF Movie Map' });
});

/* GET about page. */
router.get('/about', function(req, res, next) {
  res.render('about', { title: 'SF Movie Map' });
});

/* GET movie_list page. */
router.get('/movie_list', function(req, res) {
    var db = req.db;
    var collection = db.get('movie_dump');
    collection.find({}, {}, function(e, docs){
        res.render('movie_list', {
            'title' : 'SF Movie Map',
            'movies' : docs,
        });
    });
});

module.exports = router;
