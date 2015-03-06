/*
 * search_controller.js
 *
 * Handles auto-complete search based on movie title.
 * Uses jQuery autocomplete widget.
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

    /**
     * Invoke SF Movie Map back-end to get autocompleted results.
     */
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
     * "Module" declaration (declares public functions exposed by this module):
     */
    this.SearchController = function() {
        return {
            init: init,
        }
    };

}(jQuery, _));
