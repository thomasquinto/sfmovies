# SF Movie Map (sfmovies)

A simple web application built on Node.js, MongoDB, and Google Maps JavaScript API that displays San Francisco film locations on a map. The map updates as it is navigated, and a search box presents auto-completed results based on Movie Title.

## Installation (after cloning source from GitHub):

Prerequisites:
You must have node.js and mongo installed on your system.

Then, on unix command-line within application home directory:

1) Download raw SF film location data as JSON from data.sfgov.org:

wget --no-check-certificate https://data.sfgov.org/resource/yitu-d5am.json

2) Create data directory, and start mongo:

mkdir data
mongod --dbpath ./data

3) Import film location JSON into mongo: 

mongoimport --jsonArray -d sfmovies --collection movie_locations --file yitu-d5am.json

4) Run node.js script to gather geocoded data from Google Maps API: 

script/geocode.js

5) Run node.js script to gather movie metadata (like Box Art image) from NextGuide API: 

script/match_shows.js

6) In mongo client, create a geo-spatial index for fast querying of movie locations based on latitude/longitude:
  > db.movie_locations.createIndex( { loc: "2d" }, { min : -500,  max : 500,  w :1 } );
    
## Usage

In application home directory:
(This may require root admin access/password since it's configured to run on Port 80 by default.)

node app.js
OR
sudo node app.js

Now open a browser and go to 'http://localhost'.

## Technology

Node.js
MongoDB
Google Maps Javascript API v3
jQuery
Bootstrap

## License

LGPL (Lesser GNU Public License) version 3

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

