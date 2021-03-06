/**
 * map_controller.js
 *
 * Handles all map handling for SF Movie Map application.
 * Uses Google Maps API.
 */ 
;(function($, _) {

    /**
     * Default San Francisco Latitude/Longitude location (center):
     */
    var _sfLatitudeLongitude = [37.78819551746348, -122.44551830688476];

    /**
     * Default "Zoom" parameter:
     */
    var _defaultZoom = 13;

    /**
     * Reference to map instance:
     */ 
    var _map = null;

    /**
     * Reference to currently displayed markers on map, stored in an array.
     */
    var _markers = [];

    /**
     * State map logic: only 2 states:
     *    _state_update_on_bounds => update markers based on moving Google Maps bounding box
     *    _state_show_selected => user clicked on a Marker to see show details
     */
    var _state_update_on_bounds = 1;
    var _state_show_selected = 2;

    var _state = _state_update_on_bounds;

    /**
     * Initializes Google Map and associated Markers.
     */
    function init() {
        var mapOptions = {
            zoom: _defaultZoom,
            center: new google.maps.LatLng(_sfLatitudeLongitude[0], _sfLatitudeLongitude[1])
            
        };
        _map = new google.maps.Map($("#map")[0], mapOptions);

        google.maps.event.addListener(_map, "idle", function() {
            //console.log("map bounds: " + _map.getBounds() + ", center: " + _map.getCenter());
            placeMarkersForBounds();
        });

        placeMarkersForBounds();

        $('.redo :checkbox').click(function() {
            var $this = $(this);
            if ($this.is(':checked')) {
                _state = _state_update_on_bounds;
                placeMarkersForBounds();
            } else {                
                _state = _state_show_selected;
            }
        });
    }

    /**
     * Places markers for locations for a single Movie Title (chosen in Search Field).
     */
    function placeMarkersForTitle(title) {
        var data = { "title": title, "exists": "loc", "limit":"100" };
        
        $('.redo :checkbox').prop('checked', false);
        _state = _state_show_selected;

        placeMarkers(data);
    }

    /**
     * Places markers that fall within the Bounding Box of the currently displayed map.
     */
    function placeMarkersForBounds() {
        if(_state != _state_update_on_bounds) return;

        // Don't update if map is moving because of infowindow being auto-panned:
        for(var i=0;i<_markers.length;i++) {
            if(_markers[i] && _markers[i].infoWindow && _markers[i].infoWindow.opened) {
                return;
            }
        }


        $('#search').val('');
        
        var data = { "exists": "loc", "limit":"100" };

        if(_map && _map.getBounds()) {
            data.bounds = _map.getBounds().toString();
        }

        placeMarkers(data);
    }

    /**
     * Places markers based on 'data' hash options.
     */
    function placeMarkers(data) {
        
        // We only care about 'loc' parameter, so 'geocodes' blob can be omitted from results for faster loading:
        data.exc = 'geocodes';

        $.ajax(
            {
                url: "locations.json",
                data: data,
                success: placeMarkersCallback
            }
        );
    }

    /**
     * Handler when results return for 'locations.json' request to SF Movie Map backend.
     */
    function placeMarkersCallback(response) {

        //console.log("response total locations: " + response.locations.length);
       
        // Find new markers to add, remove current markers not in new response,
        // and retain/leave alone existing (i.e. don't remove and redraw them)
        var toAdd = [];
        if(response && response.locations) {
            // Add all locations in response into hash with _id => location:
            var responseLocations = {};
            for(var i=0; i < response.locations.length; i++) {
                responseLocations[response.locations[i]._id] = response.locations[i];
            }

            // Remove existing locations not in locations in response
            // (and put existing locations in existing hash keyed on _id):
            var existing = {};
            var deletedCount = 0;
            for(var i=_markers.length-1; i>=0; i--) {
                if(!_markers[i]) continue;
                var location = _markers[i].location;
                if(location && !responseLocations[location._id]) {
                    // Old marker not in new response; delete:
                    _markers[i].setMap(null);
                    delete _markers[i];
                    deletedCount++;
                } else {
                    existing[location._id] = location;
                }
            }

            // For all locations in response, find ones not already on map:
            for(var key in responseLocations) {
                var location = responseLocations[key];
                if(location && !existing[location._id]) {
                    toAdd.push(location);
                }
            }

            //console.log("Deleted %d | Added %d | Retained %d", deletedCount, toAdd.length, Object.keys(existing).length);
        }        

        // Add a Marker for each new location:
        _.each(toAdd, function(location) {
            addMarkerForLocation(location);
        });   

        // If 'show selected' state, pop-up InfoWindow for first Marker:
        if(_state == _state_show_selected && _markers.length) {
            
            for(var i=0; i<_markers.length; i++) {
                var marker = _markers[i];            
                if(marker) {
                    marker.infoWindow.open(_map, marker);
                    markerClicked(marker.location);
                    break;
                }

                // Fit all locations for the selected show by changing map bounds:
                if(response.locations && response.locations.length > 1) {
                    fitMapWithinBoundsOfLocations(response.locations);
                }
            }
        }
    }

    /**
     * Changes bounds of map to encompass all locations in array.
     */
    function fitMapWithinBoundsOfLocations(locations) {

        var minLat;
        var minLon;
        var maxLat;
        var maxLon;
                
        for(var i=0; i < locations.length; i++) {            
            var loc = locations[i].loc;
            
            if(!minLat) minLat = loc[0];
            else if(loc[0] < minLat) minLat = loc[0];
            
            if(!minLon) minLon = loc[1];
            else if(loc[1] < minLon) minLon = loc[1];
            
            if(!maxLat) maxLat = loc[0];
            else if(loc[0] > maxLat) maxLat = loc[0];
            
            if(!maxLon) maxLon = loc[1];
            else if(loc[1] > maxLon) maxLon = loc[1];
        }
        
        //console.log('(minLat: %d, minLon: %d), (maxLat: %d, maxLon: %d)', minLat, minLon, maxLat, maxLon);
        if(minLat && minLon && maxLat && maxLon) {
            _map.fitBounds(new google.maps.LatLngBounds(
                new google.maps.LatLng(minLat, minLon),
                new google.maps.LatLng(maxLat, maxLon))
            );
        }
    }

    /**
     * Creates a GoogleMaps Marker object based on a single movie location and adds
     * it to the markers array.
     */
    function addMarkerForLocation(location) {
        //console.log("location title: " + location.title);
        
        var latLng = new google.maps.LatLng(location.loc[0], location.loc[1]);
        var markerOptions = {
            position: latLng,
            title: location.title + " (" + location.locations + ")",
            map: _map
        };
        
        var marker = new google.maps.Marker(markerOptions);
        marker.location = location;
        
        // Put marker on the map
        marker.setMap(_map);
        _markers.push(marker);
        
        // Initialize click function so InfoWindow shows movie art and metadata in pop-up
        google.maps.event.addListener(marker, 'click', function() {
            markerClicked(location);
        });
        
        var infoWindow = new google.maps.InfoWindow({ 
            content: getInfoWindowHtml(location) 
        });
        marker.infoWindow = infoWindow;
            
        // Add mouseover event so that InfoWindow pops up on hover:
        google.maps.event.addListener(marker, 'mouseover', function() {
            dismissCurrentInfoWindow();
            infoWindow.open(_map, marker);
            infoWindow.opened = true;
        });
        
        // Close InfoWindow on mouseout:
        google.maps.event.addListener(marker, 'mouseout', function() {
            infoWindow.close();
            infoWindow.opened = false;
        });                    
    }

    /**
     * Close any other currently open InfoWindow:
     */
    function dismissCurrentInfoWindow() {
        for(var i=0;i<_markers.length;i++) {
            if(_markers[i] && _markers[i].infoWindow) {
                _markers[i].infoWindow.close();
                _markers[i].infoWindow.opened = false;
            }
        }
    }


    /**
     * Returns thumbnail Box Art image for movie (if one exists):
     */
    function getThumbnailImage(location) {                        
        var thumbnailImage = null;

        if(location.show_data && location.show_data.images) {            
            var sortedImages = _.sortBy(location.show_data.images, function(image) { return image.width; });
            
            var thumbnailImage = _.find(sortedImages, function(image) {
                if(image.category.indexOf('Box Art') > -1) {
                    return image;
                }
            });
        }
        
        return thumbnailImage;
    }

    /**
     * Builds html for InfoWindow pop-up for a given location.
     */
    function getInfoWindowHtml(location) {

        var thumbnailImage = getThumbnailImage(location);

        var html = _.template(
            '<div class="infowindow_div">' + 
                '<% if (thumbnailImage) { %>' +
                '<img class="infowindow_img" src="<%= thumbnailImage.url%>" />' + 
                '<% } else {  %>' +
                '<div><%= location.title %> (<%= location.release_year %>)</div>' +
                //'<div><%= location.locations %></div>' +
                '<% } %>' +
             '</div>'
        )( { location: location, thumbnailImage: thumbnailImage } );

        return html;
    }

    /**
     * Displays Movie metadata in bottom panel for latest selected movie.
     */
    function markerClicked(location) {
        //console.log("location clicked: " + location.title);
       
        var thumbnailImage = getThumbnailImage(location);

        var html = _.template(
            '<div class="panel panel-default">' + 
                '<div class="panel-heading"><h4><%= location.title %> (<%= location.release_year %>)</h4></div>' + 
                '<div class="panel-body">' + 

                '<% if (thumbnailImage) { %>' +
                '<img class="panel_img" src="<%= thumbnailImage.url%>" />' +
                '<% } %>' +

                '<% if (location.director) { %>' +
                '<p>Director: <%= location.director %>' +
                '</p>' +
                '<% } %>' +

                '<% if (location.actor_1) { %>' +
                '<p>Cast: <%= location.actor_1 %>' +
                  '<% if (location.actor_2) { %>' +
                  ', <%= location.actor_2 %>' +
                  '<% } %>' +
                  '<% if (location.actor_3) { %>' +
                  ', <%= location.actor_3 %>' +
                  '<% } %>' +
                '</p>' +
                '<% } %>' +

                '<p>Filmed at <%= location.locations %> (<a id="all_locations" href="javascript:void()">See all locations</a>)</p>' +

                '<% if (location.fun_facts) { %>' +
                '<p>Fun Fact: <%= location.fun_facts %></p>' +
                '<% } %>' +

                '<% if (location.show_data) { %>' +
                '<p>See more on <a href="javascript:void()" onclick="window.open(\'http://nextguide.tv/<%= location.show_data.dijit_id %>\')">NextGuide.tv</a></p>' +
                '<% } %>' +

                '</div>' +
             '</div>'
        )( { location: location, thumbnailImage: thumbnailImage } );

        $('#show').empty();
        $('#show').append(html);
        $('#show').css('display', 'block');

        // Activate 'See all locations' link:
        $('#all_locations').click(function() {
            dismissCurrentInfoWindow();            
            placeMarkersForTitle(location.title);
        });
    }

    /*
     * "Module" declaration (declares public functions exposed by this module):
     */
    this.MapController = function() {
        return {
            init: init,
            placeMarkersForTitle: placeMarkersForTitle
        }
    };

}(jQuery, _));
