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
    var _sfLatitudeLongitude = [37.7833, -122.4167]; // SF: 37.7833° N, 122.4167° W

    /**
     * Default "Zoom" parameter:
     */
    var _defaultZoom = 13;

    /**
     * Reference to map instance:
     */ 
    var _map = null;

    /**
     * Reference to currently displayed markers:
     */
    var _markers = [];

    /**
     * State map logic: only 2 states:
     *    'update on bounds' => update markers based on moving Google Maps bounding box
     *    'show selected' => user clicked on a Marker to see show details
     */
    var _states = [ 'update_on_bounds', 'show_selected' ];
    var _state = _states[0];

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
            //console.log("map bounds: " + _map.getBounds());
            placeMarkersForBounds();
        });

        placeMarkersForBounds();

        $('.redo :checkbox').click(function() {
            var $this = $(this);
            if ($this.is(':checked')) {
                _state = 'update_on_bounds';
            } else {                
                _state = 'show_selected';
            }
        });
    }

    /**
     * Places markers for locations for a single Movie Title.
     */
    function placeMarkersForTitle(title) {
        var data = { "title": title, "limit":"100" };
        
        $('.redo :checkbox').prop('checked', false);
        _state = 'show_selected';

        placeMarkers(data);
    }

    /**
     * Places markers that fall within the Bounding Box of the currently displayed map.
     */
    function placeMarkersForBounds() {
        if(_state != 'update_on_bounds') return;

        // Don't update if map is moving because of infowindow being auto-panned:
        for(var i=0;i<_markers.length;i++) {
            if(_markers[i] && _markers[i].infoWindow && _markers[i].infoWindow.opened) {
                return;
            }
        }


        $('#search').val('');
        
        var data = { "exists": "loc,show_data", "limit":"100" };
        placeMarkers(data);
    }

    /**
     * Places markers based on 'data' hash options.
     */
    function placeMarkers(data) {
        if(_map && _map.getBounds()) {
            data.bounds = _map.getBounds().toString();
        }

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

        //console.log("response total locations: " + responase.locations.length);
       
        /*
        // Clear all existing markers, and redraw all locations in response
        // (which possibly removes and then re-adds existing locations)
        for (var i = 0; i < _markers.length; i++) {
            _markers[i].setMap(null);
        }
        _markers = [];
        toAdd = response.locations;
        */

        // Find new markers to add, remove current markers not in new response,
        // and retain/leave alone existing (i.e. don't remove and redraw them)
        var toAdd = [];
        if(response && response.locations) {
            // Add all locations in response into hash with _id => location:
            var responseLocations = {};
            for(var i=0; i < response.locations.length; i++) {
                var location = response.locations[i];
                responseLocations[location._id] = location;
            }

            // Remove existing locations not in locations in response
            // (and put existing locations in existing hash keyed on _id):
            var existing = {};
            var deletedCount = 0;
            for(var i=_markers.length-1; i>=0; i--) {
                if(!_markers[i]) continue;
                var location = _markers[i].location;
                if(location && !responseLocations[location._id]) {
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

        _.each(toAdd, function(location) {
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
            
            if(location.show_data && location.show_data.images) {
                
                var sortedImages = _.sortBy(location.show_data.images, function(image) { return image.width; });
                
                var thumbnailImage = _.find(sortedImages, function(image) {
                    if(image.category.indexOf('Box Art') > -1) {
                        return image;
                    }
                });
                
                if(thumbnailImage) {
                                        
                    var infoWindow = new google.maps.InfoWindow({
                        content: "<img class='infowindow_img' src='" + thumbnailImage.url + "' />"
                    });

                    marker.infoWindow = infoWindow;
                    
                    google.maps.event.addListener(marker, 'mouseover', function() {
                        for(var i=0;i<_markers.length;i++) {
                            if(_markers[i] && _markers[i].infoWindow) {
                                _markers[i].infoWindow.close();
                                _markers[i].infoWindow.opened = false;
                            }
                        }

                        infoWindow.open(_map, marker);
                        infoWindow.opened = true;
                    });

                    google.maps.event.addListener(marker, 'mouseout', function() {
                        infoWindow.close();
                        infoWindow.opened = false;
                    });                    
                }
            }            

        });   

        // If 'show selected' state, pop-up InfoWindow for first Marker:
        if(_state == 'show_selected' && _markers.length) {
            var marker = _markers[0];            
            marker.infoWindow.open(_map, marker);
            markerClicked(marker.location);
        }
     
    }

    /**
     * Displays Movie metadata in bottom panel for latest selected movie.
     */
    function markerClicked(location) {
        console.log("location clicked: " + location.title);
       
        var html = _.template(
            '<div class="panel panel-default">' + 
                '<div class="panel-heading"><%= location.title %></div>' + 
                '<div class="panel-body">' + 
                '<p><%= location.locations %></p>' +
             '</div>'
        )( { location: location } );

        $('#show').empty();
        $('#show').append(html);
        $('#show').css('display', 'block');
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
