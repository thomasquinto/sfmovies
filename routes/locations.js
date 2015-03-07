var express = require('express');
var router = express.Router();

/**
 * GET locations (returns HTML)
 *
 * Returns a list of locations based on query parameters.
 * @param {string} req.query.exists 'is not null' equivalent (accepts comma-delimited list)
 * @param {string} req.query.title 'where title = ?' equivalent
 * @param {string} req.query.bounds bounding box param in format: "((lat1, lon1), (lat2, lon2))"
 * @param {string} req.query.exc exclude field in response (accepts comma-delimited list)
 * @param {int} req.query.offset Offset
 * @param {int} req.query.limit Limit
 */
router.get('/locations', function(req, res) {
    var fun = function(e, docs) {     
        res.render('locations', {
            'title' : 'SF Movie Map',
            'locations' : docs,
        });
    };
    
    getLocations(req, res, fun);
});

/**
 * GET locations.json (returns JSON)
 *
 * Returns a list of locations based on query parameters.
 * @param {string} req.query.exists 'is not null' equivalent (accepts comma-delimited list)
 * @param {string} req.query.title 'where title = ?' equivalent
 * @param {string} req.query.bounds bounding box param in format: "((lat1, lon1), (lat2, lon2))"
 * @param {string} req.query.exc exclude field in response (accepts comma-delimited list)
 * @param {int} req.query.offset Offset
 * @param {int} req.query.limit Limit
 */
router.get('/locations.json', function(req, res) {
    var fun = function(e, docs) { 
        res.send({ 'locations' : docs });
    };

    getLocations(req, res, fun);
});

/**
 * Performs mongo query on movie_locations table by interpreting request parameters.
 * (Not using Monk, but instead underlying MongoDB driver in order to use combination
 * of limit AND excluded return fields).
 */
function getLocations(req, res, fun) {

    var db = req.db;
    var collection = db.get('movie_locations');
    var results = collection.col.find(getCriteria(req), getOptions(req));

    var limit = req.query.limit ? parseInt(req.query.limit) : null;
    var skip = req.query.offset ? parseInt(req.query.offset) : 0;

    if(limit) {
        results.limit(limit).skip(skip).toArray(fun);
    } else {
        results.skip(skip).toArray(fun);
    }    
}

/**
 * Returns a criteria hash for:
 *     $exists (field exists, or is not null, for entry)
 *     $title (where title = ?)
 *     $bounds (bounding box defined by 2 latituide/longitude tuples)
 *
 * @param { request } Request object
 * @return { hash of criteria options } criteria hash
 */
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

/**
 * Returns an options hash for:
 *     $limit (limited number of results)
 *     $offset (offset to begin returned list)
 *
 * @param { request } Request object
 * @return { hash of criteria options } criteria hash
 */
function getOptions(req) {

    var options = {};

    if(req.query.exc) {
        var split = req.query.exc.split(",")
        for(var i=0; i<split.length; i++) {
            options[split[i]] = 0;
        }
    }

    console.log('options: ' + JSON.stringify(options));

    return options;
}

module.exports = router;
