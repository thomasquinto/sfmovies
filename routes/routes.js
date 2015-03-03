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

/* GET geocode. */
router.get('/geocode', function(req, res) {
    var db = req.db;
    var collection = db.get('movie_locations');
    collection.find({}, {}, function(e, docs) {

        var gm = req.gm
        var start = 0;
        var limit = docs.length;
        var i = start;
        var timeoutInterval = 1000;

        function setLocation(movie) {
            gm.geocode(movie.locations, function(err, data) {
                console.log("---------------------------\n");
                console.log("Title: %s, Location: %s", movie.title, movie.locations);        
                console.log("Geo data: %s", JSON.stringify(data));
                console.log("RESULTS: {}", data['results']);

                if(data['results'] && data['results'].length) {
                    collection.update( {"_id" : movie._id}, 
                                       {$set : { "geocodes" : data['results'] }} );
                }
            }, 
               // options hash:
               { "key": "AIzaSyDATd6iwCHxJUErroouJEelUB5VJ1LYjdE", 
                 "bounds": "37.4100,-122.3100|37.4800,-122.2200" } // bounding box for San Francisco
             );

            if(i < start+limit) { 
                console.log("Iteration " + i);
                setTimeout(function() { setLocation(docs[i++]) }, timeoutInterval);
            }
        };

        setTimeout(function() { setLocation(docs[i++]) }, timeoutInterval);

        res.render('movie_list', {
            'title' : 'SF Movie Map',
            'movies' : docs,
        });
    });

});


module.exports = router;
