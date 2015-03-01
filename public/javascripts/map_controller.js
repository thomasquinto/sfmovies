/*
 * map_controller.js
 *
 * Handles all map handling for SF Movie Map application.
 * Uses Google Maps API.
 */ 
;(function($, _) {

    /*
     * Default San Francisco Latitude/Longitude location:
     */
    var _sfLatitudeLongitude = [37.7833, -122.4167]; // SF: 37.7833° N, 122.4167° W

    /*
     * Default "Zoom" parameter:
     */
    var _defaultZoom = 12;

    /*
     * Reference to map instance:
     */ 
    var _map = null;

    function init() {
        var mapOptions = {
          zoom: _defaultZoom,
          center: new google.maps.LatLng(_sfLatitudeLongitude[0], _sfLatitudeLongitude[1])
        };
        _map = new google.maps.Map($("#map")[0], mapOptions);
    }

    /*
     * "Module" declaration (declares public functions offered by this module):
     */
    this.MapController = function() {
        return {
            init: init,
        }
    };

}(jQuery, _));
