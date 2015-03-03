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
    var collection = db.get('movie_locations');
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

            // See: https://developers.google.com/maps/documentation/geocoding/?csw=1#GeocodingRequests
            gm.geocode(movie.locations, function(err, data) {

                console.log("---------------------------\n");
                console.log("Title: %s, Location: %s", movie.title, movie.locations);        
                console.log("Geo data: %s", JSON.stringify(data));
                console.log("Results: {}", data['results']);

                if(data['results'] && data['results'].length) {
                    collection.update( {"_id" : movie._id}, 
                                       {$set : { "geocodes" : data['results'] }} );
                }
            }, 
               // options hash:
               { 
                   "key" : "AIzaSyDATd6iwCHxJUErroouJEelUB5VJ1LYjdE", 
                   "bounds" : "37.4100,-122.3100|37.4800,-122.2200",  // bounding box for San Francisco
                   "region" : "us"
               }
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

/* GET match_shows. */
router.get('/match_shows', function(req, res) {
    var db = req.db;
    var collection = db.get('movie_locations');
    collection.find({}, {}, function(e, docs) {

        var http = req.http;
        var start = 0;
        var limit = 10;//docs.length;
        var i = start;
        var timeoutInterval = 1000;

        function setTmsId(movie) {
            
            console.log("Pre Movie Title: {}", movie.title);

            var options = {
                host: 'api-guide.nextguide.tv',
                port: 80,
                path: '/api/faceted_search.json?inc_images=1&phrase=' + encodeURIComponent(movie.title) + '&limit=60&src_ids=n,a,h,i&headend_id=DITV807&all=1',
            };            

            http.get(options, function(response) {
                console.log("---------------------------\n");
                console.log("response code: " + response.statusCode);

                // Continuously update stream with data
                var body = '';
                response.on('data', function(d) {
                    body += d;
                });

                response.on('end', function() {
                    
                    // Data reception is done, do whatever with it!
                    var parsed = JSON.parse(body);

                    console.log("parsed: " + JSON.stringify(parsed));

                    if(parsed.movies && parsed.movies[0] && parsed.movies[0].field_matches == 't') {
                        collection.update( {"_id" : movie._id}, 
                                           {$set : { "show_data" : parsed.movies[0] }} );
                    }

                    if(i < start+limit) { 
                        console.log("Iteration " + i);
                        setTimeout(function() { setTmsId(docs[i++]) }, timeoutInterval);
                    }
                });

            }).on('error', function(e) {           
                console.log("Movie title: {}", movie.title);
                console.log("Got error: " + e.message);
            });

        }
        
        setTimeout(function() { setTmsId(docs[i++]) }, timeoutInterval);

        res.render('movie_list', {
            'title' : 'SF Movie Map',
            'movies' : docs,
        });

    });
});


module.exports = router;
