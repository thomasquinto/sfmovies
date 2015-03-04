var express = require('express');
var router = express.Router();

/* GET geocode.
 * Iterates over each movie location and performs a Google Maps Geocode API method for each.
 */
router.get('/locations', function(req, res) {
    var db = req.db;
    var collection = db.get('movie_locations');
    collection.find( {'geocodes': { $exists: 1 }}, 
                     { 'title' : 1, 'locations' : 1, 'geocodes': 1 }, 
                     function(e, docs) {        
                         res.render('movie_list', {
                             'title' : 'SF Movie Map',
                             'movies' : docs,
                         });
                     });
});

router.get('/locations.json', function(req, res) {
    var db = req.db;
    var collection = db.get('movie_locations');
    collection.find( {'geocodes': { $exists: 1 }, 'show_data.images': { $exists: 1 }}, 
                     { 'limit' : 100, 'title' : 1, 'locations' : 1, 'geocodes': 1 }, 
                     function(e, docs) {        
                         res.json('locations', docs);
                     });
});

module.exports = router;
