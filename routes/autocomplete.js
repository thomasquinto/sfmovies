var express = require('express');
var router = express.Router();
var Autocomplete = require('autocomplete')
var auto;

/* GET autocomplete.
 * Returns autocomplete results for movie title.
 */

router.get('/autocomplete.json', function(req, res) {

    var phrase = req.query.phrase.toLowerCase();
    console.log('phrase: ' + phrase);

    if(!auto) {
        console.log('Initializing Trie...');
        init(req.db, res, phrase);
    } else {
        res.send({ 'autocomplete' : getResults(phrase) });
    }
});

function getResults(phrase) {
    var results = auto.search(phrase);
    for(var i=0; i<results.length; i++) {
        results[i] = toTitleCase(results[i]);
    }
    return results;
}

function init(db, res, phrase) {
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

                                     if(phrase) {
                                         res.send({ 'autocomplete' : getResults(phrase) });
                                     }
                                 });
                             });
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

module.exports = router;
