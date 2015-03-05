var express = require('express');
var router = express.Router();
var Autocomplete = require('autocomplete')
var auto;

/* GET autocomplete.
 * Returns autocomplete results for movie title.
 */

router.get('/autocomplete.json', function(req, res) {
    if(!auto) {
        console.log('Building Trie! No results yet.');
        init(req.db);
        res.send({ 'autocomplete' : [] });
    } else {
        var phrase = req.query.phrase;//.toLowerCase();
        console.log('phrase: ' + phrase);

        var results = auto.search(phrase);
        for(var i=0; i<results.length; i++) {
            results[i] = toTitleCase(results[i]);
        }

        res.send({ 'autocomplete' : results });
    }
});

function init(db, callback) {
    var collection = db.get('movie_locations');

    // > db.movie_locations.aggregate( { $group : { _id: '$title' } } )
    collection.col.aggregate([{ '$group' : { _id: '$title' } }], {},
                             function(e, docs) {            
                                 var titles = [];
                                 for(var i=0; i<docs.length; i++) {
                                     var title = docs[i]._id;
                                     title = title.replace('"', '');
                                     title = title.toLowerCase();
                                     titles.push(title);
                                 }
                                 
                                 auto = new Autocomplete.connectAutocomplete();
                                 auto.initialize(function(onReady) {
                                     onReady(titles);
                                     console.log('Trie initialized!');
                                 });
                             });
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

module.exports = router;
