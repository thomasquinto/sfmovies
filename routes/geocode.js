var express = require('express');
var router = express.Router();

/* GET geocode.
 * Iterates over each movie location and performs a Google Maps Geocode API request to populate geocode results.
 */
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

                console.log('---------------------------\n');
                console.log('Title: %s, Location: %s', movie.title, movie.locations);        
                console.log('Geo data: %s', JSON.stringify(data));
                console.log('Results: {}', data['results']);

                if(data['results'] && data['results'].length) {
                    collection.update( {'_id' : movie._id}, 
                                       {$set : { 'geocodes' : data['results'] }} );
                }
            }, 
               // options hash:
               { 
                   'key' : 'AIzaSyDATd6iwCHxJUErroouJEelUB5VJ1LYjdE', 
                   'bounds' : '37.4100,-122.3100|37.4800,-122.2200',  // bounding box for San Francisco
                   'region' : 'us'
               }
             );

            if(i < start+limit) { 
                console.log('Iteration ' + i);
                setTimeout(function() { setLocation(docs[i++]) }, timeoutInterval);
            }
        };

        setTimeout(function() { setLocation(docs[i++]) }, timeoutInterval);

        res.render('locations', {
            'title' : 'SF Movie Map',
            'locations' : docs,
        });
    });
});

module.exports = router;
