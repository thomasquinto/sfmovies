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

    function getSFLatitudeLongitude() {
        return _sfLatitudeLongitude;
    }

    function getDefaultZoom() {
        return _defaultZoom;
    }

    function initMap(map) {
        _map = map;
    }

    /*
     * "Module" declaration (declares public functions offered by this module):
     */
    this.MapController = function() {
        return {
            getSFLatitudeLongitude: getSFLatitudeLongitude,
            getDefaultZoom: getDefaultZoom,
            initMap: initMap
        }
    };

}(jQuery, _));
