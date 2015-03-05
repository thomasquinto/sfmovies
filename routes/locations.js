var express = require('express');
var router = express.Router();

/* GET geocode.
 * Iterates over each movie location and performs a Google Maps Geocode API method for each.
 */

router.get('/locations', function(req, res) {
    var db = req.db;
    var collection = db.get('movie_locations');

    collection.find( getCriteria(req),
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

    collection.find( getCriteria(req),
                     getOptions(req),
                     function(e, docs) {                             
                         res.send({ 'locations' : docs });
                     });    
});

function getCriteria(req) {
    var criteria = {};

    if(req.query.exists) {
        var split = req.query.exists.split(",")
        for(var i=0; i<split.length; i++) {
            criteria[split[i]] = { $exists: 1 }; 
        }
    }

    if(req.query.bounds) {
        var split = req.query.bounds.split(",");

        var bounds1_lat = parseFloat(split[0].replace('((', '').replace(' ',''));
        var bounds1_lng = parseFloat(split[1].replace(')', '').replace(' ',''));
        var bounds2_lat = parseFloat(split[2].replace('(', '').replace(' ',''));
        var bounds2_lng = parseFloat(split[3].replace('))', '').replace(' ',''));        
        var boundsBox = [ [ bounds1_lat, bounds1_lng ], [ bounds2_lat, bounds2_lng ] ];

        criteria.loc = { $within: { $box: boundsBox } }
    }

    if(req.query.title) {
        criteria.title = req.query.title;
    }

    console.log('criteria: ' + JSON.stringify(criteria));

    return criteria;
}

function getOptions(req) {
    var options = {};

    if(req.query.limit) {
        options['limit'] = req.query.limit;
    }

    if(req.query.offset) {
        options['skip'] = req.query.offset;
    }

    console.log('options: ' + JSON.stringify(options));

    return options;
}

module.exports = router;
