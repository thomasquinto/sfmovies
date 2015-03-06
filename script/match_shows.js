#!/usr/bin/env node

/**
 * Usage (invoked from application home directory):
 *
 * # script/match_shows.js
 *
 * Iterates over all entries in the 'movie_locations' MongoDB collection and invokes a NextGuide
 * request to match on the Movie Title field. If a match is found, the 'show_data' field is populated
 * for the entry, including additional movie metadata like Box Art image.
 */

// Http Client for external web services API requests:
var http = require('http')

// MongoDB:
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/sfmovies');

/**
 * Iterates over each movie location and performs a NextGuide search request to populate show data.
 */
function matchShows() {
    var collection = db.get('movie_locations');
    collection.find({}, {}, function(e, docs) {

        var start = 0;
        var limit = docs.length;
        var i = start;
        var timeoutInterval = 10; // No real rate limit with NextGuide API.

        function setShowData(movie) {
            
            var options = {
                host: 'api-guide.nextguide.tv',
                port: 80,
                path: '/api/faceted_search.json?inc_images=1&phrase=' + encodeURIComponent(movie.title) + '&limit=60&src_ids=n,a,h,i&headend_id=DITV807&all=1',
            };            

            http.get(options, function(response) {
                console.log('---------------------------\n');
                console.log('Movie Title: %s', movie.title);
                console.log('response code: ' + response.statusCode);

                // Continuously update stream with data
                var body = '';
                response.on('data', function(d) {
                    body += d;
                });

                response.on('end', function() {
                    
                    // Data reception is done, do whatever with it!
                    var parsed = JSON.parse(body);

                    console.log('NextGuide show data: %s', JSON.stringify(parsed));

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
                console.log('Got error for movie title %s: %s', movie.title, e.message);
            });

        }
        
        setTimeout(function() { setShowData(docs[i++]) }, timeoutInterval);

    });
}

matchShows();
