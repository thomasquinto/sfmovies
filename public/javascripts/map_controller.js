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

        placeMarkers();
    }

    function placeMarkers() {
        $.ajax({url: "locations.json", success: function(locations) {
            _.each(locations, function(location) {
                console.log("location title: " + location.title);

                var latLng = new google.maps.LatLng(location.geocodes[0].geometry.location.lat, location.geocodes[0].geometry.location.lng);
                var markerOptions = {
                    position: latLng,
                    title: location.title + " (" + location.locations + ")",
                    map: _map
                };

                var marker = new google.maps.Marker(markerOptions);

                marker.setMap(_map);

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
                        
                        google.maps.event.addListener(marker, 'mouseover', function() {
                            infoWindow.open(_map, marker);
                        });

                        google.maps.event.addListener(marker, 'mouseout', function() {
                            infoWindow.close();
                        });
                    }
                }

            });
        }});
    }

    function markerClicked(location) {
        console.log("location clicked: " + location.title);
       
        var html = _.template(
            '<div class="panel panel-default">' + 
                '<div class="panel-heading"><%= location.title %></div>' + 
                '<div class="panel-body">' + 
                '<p><%= location.locations %></p>' +
             '</div>'
        )( { location: location } );

        console.log("html: " + html);

        $('#show').empty();
        $('#show').append(html);
        $('#show').css('display', 'block');
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
