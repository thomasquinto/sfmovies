/*
 * search_controller.js
 *
 * Handles auto-complete search based on movie title.
 */ 
;(function($, _) {

    function init(mapController) {
        $( '#search' ).autocomplete({
            source: doSearch,
            select: doSelect,
            messages: {
                noResults: '',
                results: function() {}
            }
        });
    }

    function doSearch(req, res) {        
        $.ajax(
            {
                url: "autocomplete.json",
                data: { 'phrase' : $('#search').val() },
                success: function(response) {
                    if(response.autocomplete) {
                        console.log('resp:' + response.autocomplete);
                        res(response.autocomplete);
                    }                
                }
            }
        );
    }

    function doSelect(event, ui) {
        console.log("value: " + ui.item.value);
        MapController().placeMarkersForTitle(ui.item.value);
    }

    /*
     * "Module" declaration (declares public functions offered by this module):
     */
    this.SearchController = function() {
        return {
            init: init,
        }
    };

}(jQuery, _));
