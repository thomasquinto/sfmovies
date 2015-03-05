#!/usr/bin/env node

// Node Google Maps:
var gmApiKey = 'AIzaSyDATd6iwCHxJUErroouJEelUB5VJ1LYjdE';
var gm = require('googlemaps');
gm.config( { 'key': gmApiKey } )

// MongoDB:
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/sfmovies');

/** 
 * Iterates over each movie location and performs a Google Maps Geocode API request to populate geocode results.
 * To create geospatial index in mongo console for 'loc' parameter:
 * > db.movie_locations.createIndex( { loc: "2d" }, { min : -500,  max : 500,  w :1 } );
 */
function geocodeLocations() {

    var collection = db.get('movie_locations');
    collection.find({}, {}, function(e, docs) {

        var start = 0;
        var limit = docs.length;
        var i = start;
        var timeoutInterval = 1000;

        function setLocation(location) {

            // See: https://developers.google.com/maps/documentation/geocoding/?csw=1#GeocodingRequests
            gm.geocode(location.locations, function(err, data) {

                console.log('Title: %s \nLocation: %s', location.title, location.locations);        
                console.log('Geo data: %s', JSON.stringify(data));

                if(data && data.results && data.results.length) {
                    collection.update( {'_id' : location._id}, 
                                       {$set : { 'geocodes' : data['results'] }} );

                    collection.update( {'_id' : location._id}, 
                                       {$set : { 'loc' : [ data.results[0].geometry.location.lat,
                                                           data.results[0].geometry.location.lng] }} );
                }
            }, 
               // options hash:
               { 
                   'key' : gmApiKey, 
                   'bounds' : '37.4100,-122.3100|37.4800,-122.2200',  // bounding box for San Francisco
                   'region' : 'us'
               }
             );

            if(i < start+limit) { 
                console.log('\n----------------');
                console.log('Movie Location ' + i);
                setTimeout(function() { setLocation(docs[i++]) }, timeoutInterval);
            }
        };

        setTimeout(function() { setLocation(docs[i++]) }, timeoutInterval);
    });
}

geocodeLocations();
