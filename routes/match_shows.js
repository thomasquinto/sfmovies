var express = require('express');
var router = express.Router();

/* GET match_shows. 
 * Iterates over each movie location and performs a NextGuide search request to populate show data.
*/
router.get('/match_shows', function(req, res) {
    var db = req.db;
    var collection = db.get('movie_locations');
    collection.find({}, {}, function(e, docs) {

        var http = req.http;
        var start = 0;
        var limit = docs.length;
        var i = start;
        var timeoutInterval = 10;

        function setShowData(movie) {
            
            console.log('Movie Title: {}', movie.title);

            var options = {
                host: 'api-guide.nextguide.tv',
                port: 80,
                path: '/api/faceted_search.json?inc_images=1&phrase=' + encodeURIComponent(movie.title) + '&limit=60&src_ids=n,a,h,i&headend_id=DITV807&all=1',
            };            

            http.get(options, function(response) {
                console.log('---------------------------\n');
                console.log('response code: ' + response.statusCode);

                // Continuously update stream with data
                var body = '';
                response.on('data', function(d) {
                    body += d;
                });

                response.on('end', function() {
                    
                    // Data reception is done, do whatever with it!
                    var parsed = JSON.parse(body);

                    console.log('parsed: ' + JSON.stringify(parsed));

                    if(parsed.movies && parsed.movies[0] && parsed.movies[0].field_matches == 't') {
                        collection.update( {'_id' : movie._id}, 
                                           {$set : { 'show_data' : parsed.movies[0] }} );
                    }

                    if(i < start+limit) { 
                        console.log('Iteration ' + i);
                        setTimeout(function() { setShowData(docs[i++]) }, timeoutInterval);
                    }
                });

            }).on('error', function(e) {           
                console.log('Got error for movie title {}: {}' + movie.title, e.message);
            });

        }
        
        setTimeout(function() { setShowData(docs[i++]) }, timeoutInterval);

        res.render('locations', {
            'title' : 'SF Movie Map',
            'locations' : docs,
        });

    });
});

module.exports = router;
