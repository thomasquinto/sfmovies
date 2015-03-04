var express = require('express');
var router = express.Router();

/* GET geocode.
 * Iterates over each movie location and performs a Google Maps Geocode API method for each.
 */
router.get('/show_data', function(req, res) {
    var db = req.db;
    var collection = db.get('movie_locations');
    collection.find( { 'show_data' : { $exists: 1 }}, 
                     { 'limit' : 10, 'title' : 1, 'locations' : 1, 'show_data': 1 }, 
                     function(e, docs) {     
                         
                         res.format({
                             
                             /*
                             html: function(){
                                 res.render('movie_list', {
                                     'title' : 'SF Movie Map',
                                     'movies' : docs,
                                 });

                             },
                             */

                             json: function(){
                                 res.send({ 'movies' : docs });
                             }
   
                         /*
                         */
                         });
                     });
});

module.exports = router;
