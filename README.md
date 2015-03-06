# SF Movie Map (sfmovies)

A simple web application built on Node.js, MongoDB, and Google Maps JavaScript API that displays San Francisco film locations on a map. The map updates film location markers as it is navigated, and a search box presents auto-completed results based on Movie Title. Clicking on a film location will display details about the movie (below the map).

A full hosted version can be found [here](http://sfmovies.nextguide.tv). This example is hosted by Linode.

## Problem

Create a service that shows on a map where movies have been filmed in San Francisco. The user should be able to filter the view using autocompletion search.  

The data is available on [DataSF: Film Locations] (https://data.sfgov.org/Arts-Culture-and-Recreation-/Film-Locations-in-San-Francisco/yitu-d5am).

## Solution

I chose a full-stack solution, using Node.js (for my first time) with Express as the web application framework, MongoDB as the storage tier (also my first time), and an HTML5-based front-end leveraging Google Maps JavaScript API to display and manipulate a web-based map. Traditionally I have used Java or Ruby based web application frameworks, but this gave me a good excuse to finally use and try Node.js (new technology = fun).

Back-End Technologies:
* MongoDB
* Node.js
* Node Package Manager (npm)
* Express NPM Package to generate web application framework
* EJS (Embedded JavaScript) as HTML templating language
* Google Geocode API
* NextGuide movie metadata API

Front-End Technologies:
* Google Maps JavaScript API v3
* Bootstrap CSS/JavaScript for Responsive Design

I chose MongoDB as a NoSQL solution to easily import and store SF film location data available in a JSON format. MongoDB also supports geo-spatial queries, which enabled me to query movies based on their filming locations. The data import process consists of simply importing a JSON file into Mongo as a single collection called 'movie_locations'.

The first challenge was to geocode locations from the SF Data Feed, since locations were given as textual strings like "Construction Site in front of 260 Stockton St. at Post St." When I first started this project, I had wanted to use the Leaflet.js Maps open source library (because open source rules) on the front-end, but after evaluating a few geocoding services, I found that the Google Geocode API worked the best with the fuzzy, description-based locations given by DataSF. As part of Google's Terms of Service to use the Geocode API, any geocoded results shown in a map must use Google Maps, and hence my decision to switch to Google Maps on the front-end.

I wrote a simple Node.js script (`script/geocode.js`) that iterates over the list of locations in the Data SF feed. To avoid Google Rate Limits, the script takes a while to execute since it waits for 2 seconds between geocoding requests. If a geocode result is found, the JSON is set as an additional member field for that movie location in Mongo. Not all locations get geocoded, however, and some effort could be spent better parsing the location strings to get better geocoded results. Geocoded locations outside of SF city bounds are simply ignored.

I also wanted to display a movie image for each movie, so I wrote a similar script (`script/match_shows.js`) that invokes a search request based on the movie title against the NextGuide API (a service that I wrote). Similarly to the geocoding process, if a match is found, the NextGuide metadata is also imported as JSON as an additional field per movie location. Again, this matching process could better be optimized, but I got about a 50% hit rate on finding a match (although there are false positives).

The back-end mostly consists of a single JSON called `locations.json` that relatively mimics the Mongo syntax for querying collections. This is probably best illustrated by examples:
* http://sfmovies.nextguide.tv/locations.json (All locations in Mongo) 
* http://sfmovies.nextguide.tv/locations.json?offset=5&limit=10 (10 locations from offset of 5) 
* http://sfmovies.nextguide.tv/locations.json?exists=show_data (First 10 locations with existing, non-null 'show_data' field) 
* http://sfmovies.nextguide.tv/locations.json?title=Edtv (All locations for the movie with title 'Edtv') 
* http://sfmovies.nextguide.tv/locations.json?limit=10&bounds=((37.78514415367402%2C+-122.43592607421874)%2C+(37.80752571486966%2C+-122.35524522705077)) (First 10 locations within a bounding box defined by 2 latitude/longitude points) 

The front-end map uses the bounding box of the map viewport to update locations as the viewport changes, using the bounding box locations.json request.

For the search feature, I used a pre-built Node.js package aptly called 'autocomplete', which uses a trie-based structure to store phrases for optimized querying as keystrokes are entered by the user. This invokes the `autocomplete.json` endpoint on the back-end, which upon first request builds the trie via a MongoDB query. Once the trie is initialized, it spits back Movie Title results. The return Movie Title can then be used to retrieve the full `movie_location` entity for Mongo, which is then displayed in the Show Detail pane below the map.

## Installation (after cloning source from GitHub):

Prerequisites:
You must have node.js and mongo installed on your system.

Then, on unix command-line within application home directory:

1) Download raw SF film location data as JSON from data.sfgov.org:

`wget --no-check-certificate https://data.sfgov.org/resource/yitu-d5am.json`

2) Create data directory, and start mongo:

`mkdir data`  
`mongod --dbpath ./data`

3) Import film location JSON into mongo: 

`mongoimport --jsonArray -d sfmovies --collection movie_locations --file yitu-d5am.json`

4) Run node.js script to gather geocoded data from Google Maps API: 

`script/geocode.js`

5) Run node.js script to gather movie metadata (like Box Art image) from NextGuide API: 

`script/match_shows.js`

6) In mongo client, create a geo-spatial index for fast querying of movie locations based on latitude/longitude:

  `mongo`  
  `> use sfmovies;`  
  `> db.movie_locations.createIndex( { loc: "2d" }, { min : -500,  max : 500,  w :1 } );`
    
## Usage

In application home directory:
(This may require root admin access/password since it's configured to run on Port 80 by default.)

`node app.js`  
OR  
`sudo node app.js`  

Now open a browser and go to 'http://localhost'.

## License

LGPL (Lesser GNU Public License) version 3

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

