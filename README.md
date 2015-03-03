# sfmovies

# How to import SF Film Location data into MongoDB:
# 1) wget --no-check-certificate https://data.sfgov.org/resource/yitu-d5am.json
# 2) mongod --dbpath ./data
# 3) mongoimport --jsonArray -d sfmovies --collection movie_locations --file yitu-d5am.json 
