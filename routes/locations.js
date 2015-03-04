var express = require('express');
var router = express.Router();

/* GET geocode.
 * Iterates over each movie location and performs a Google Maps Geocode API method for each.
 */

router.get('/locations', function(req, res) {
    var db = req.db;
    var collection = db.get('movie_locations');

    collection.find( getExists(req),
                     getOptions(req),
                     function(e, docs) {     
                         res.render('locations', {
                             'title' : 'SF Movie Map',
                             'locations' : docs,
                         });
                     });
});

router.get('/locations.json', function(req, res) {
    var db = req.db;
    var collection = db.get('movie_locations');

    collection.find( getExists(req),
                     getOptions(req),
                     function(e, docs) {                             
                         res.send({ 'locations' : docs });
                     });    
});

function getExists(req) {
    var exists = {};

    if(req.query.exists) {
        var split = req.query.exists.split(",")
        for(var i=0; i<split.length; i++) {
            exists[split[i]] = { $exists: 1 }; 
        }
    }

    return exists;
}

function getOptions(req) {
    var options = {};

    if(req.query.limit) {
        options['limit'] = req.query.limit;
    }

    if(req.query.offset) {
        options['skip'] = req.query.offset;
    }

    return options;
}

module.exports = router;
