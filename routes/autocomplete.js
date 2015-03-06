var express = require('express');
var router = express.Router();
var Autocomplete = require('autocomplete')
var auto;
var scrubbedToOriginal = {};

/**
 * GET automplete.
 * Returns auto-complete results for a movie title based on a submitted phrase.
 * On first request, builds a word 'trie' index for optimized querying.
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

/**
 * Returns original Movie Title string associated with search phrase.
 *
 * @param {string} phrase Search phrase mapped to Movie Title
 */
function getResults(phrase) {
    var results = auto.search(phrase);
    for(var i=0; i<results.length; i++) {
        results[i] = scrubbedToOriginal[results[i]];
    }
    return results;
}

/**
 * Initialization function that performs a 'group by' equivalent query on Movie Title field
 * (with existing geocoded locations) to build a word trie.
 *
 * @param {string} phrase Initial search phrase query
 */
function init(db, res, phrase) {
    var collection = db.get('movie_locations');

    // For entries with existing locations, group by title:
    // > db.movie_locations.aggregate( [ { $match : { 'loc': { $exists: 1} } }, { $group : { _id: '$title' } }] );
    collection.col.aggregate([{ $match : { 'loc': { $exists: 1} } }, { '$group' : { _id: '$title' } }], {},
                             function(e, docs) {            
                                 var titles = [];
                                 for(var i=0; i<docs.length; i++) {

                                     var title = docs[i]._id;

                                     // 'scrub' the title for easier, generalized matching:
                                     var lower = title.replace('"', '');
                                     lower = lower.toLowerCase().trim();

                                     scrubbedToOriginal[lower] = title;
                                     titles.push(lower);

                                     // Enable search matches without first-word articles:
                                     var startsWithMembers = ['a ', 'an ', 'the '];
                                     for(var j=0; j < startsWithMembers.length; j++) {
                                         if(lower.lastIndexOf(startsWithMembers[j], 0) === 0) {
                                             var chopped = lower.substring(startsWithMembers[j].length);
                                             scrubbedToOriginal[chopped] = title;
                                             titles.push(chopped);
                                         }
                                     }
                                 }
                                 
                                 auto = new Autocomplete.connectAutocomplete();
                                 auto.initialize(function(onReady) {
                                     onReady(titles);
                                     console.log('Trie initialized!');

                                     // With a freshly initialized trie, not satisfy the original request:
                                     if(phrase) {
                                         res.send({ 'autocomplete' : getResults(phrase) });
                                     }
                                 });
                             });
}

module.exports = router;
