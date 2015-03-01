;(function($, _) {

    var _sfLatitudeLongitude = [37.7833, -122.4167]; // SF: 37.7833° N, 122.4167° W
    var _defaultZoom = 12;

    /*
     * Initialize Leaflet JS Map with San Francisco defaults.
     */
    function initMapWithSFDefaults() {
        initMap(_sfLatitudeLongitude, _defaultZoom);
    }

    /*
     * Initialize Leaflet JS Map.
     * latitudeLongitude => latitude and longitude as an array of 2 floats
     * zoom => zoom level (integer)
     */
    function initMap(latitudeLongitude, zoom) {
        // create a map in the "map" div, set the view to a given place and zoom
        var map = L.map('map').setView(latitudeLongitude, zoom);
        
        // add an OpenStreetMap tile layer
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // add a marker in the given location, attach some popup content to it and open the popup
        L.marker(latitudeLongitude).addTo(map)
            .bindPopup('A pretty CSS3 popup. <br> Easily customizable.')
            .openPopup();
    }

    this.MapController = function() {
        return {
            initMapWithSFDefaults: initMapWithSFDefaults,
            initMap: initMap
        }
    };

}(jQuery, _));
