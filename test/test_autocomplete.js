/**
 * Tests 'autocomplete.json' endpoint.
 *
 * NOTE: Your server must be running for tests to run!
 */

// Http Client to invoke localhost test requests:
var http = require('http')
var testHost = 'localhost' // change if hosted elsewhere
var testPort = 80;

exports.testAutocomplete1 = function(test){
    var options = {
        host: testHost,
        port: testPort,
        path: '/autocomplete.json?phrase=star%20trek'
    }; 

    http.get(options, function(response) {

        test.expect(4);
        test.ok(response.statusCode == '200', 'status code, pass')
        
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        
        response.on('end', function() {            
            // Data reception is done, do whatever with it!
            var parsed = JSON.parse(body);

            test.ok(parsed.autocomplete, 'valid autocomplete response');
            test.ok(parsed.autocomplete.length > 0, 'non-zero autocomplete results');
            test.ok(parsed.autocomplete[0].substring(0,4).toLowerCase() == 'star', 'valid beginning letter');
            test.done();
        
        }).on('error', function(e) {           
            test.ok(false, "got http error, fail");
        });
    });
};

exports.testAutocomplete2 = function(test){
    var options = {
        host: testHost,
        port: testPort,
        path: '/autocomplete.json?phrase=maltese'
    }; 

    http.get(options, function(response) {

        test.expect(4);
        test.ok(response.statusCode == '200', 'status code, pass')
        
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        
        response.on('end', function() {            
            // Data reception is done, do whatever with it!
            var parsed = JSON.parse(body);
            test.ok(parsed.autocomplete, 'valid autocomplete response');
            test.ok(parsed.autocomplete.length > 0, 'non-zero autocomplete results');
            test.ok(parsed.autocomplete[0] == 'The Maltese Falcon', 'valid match');
            test.done();
        
        }).on('error', function(e) {           
            test.ok(false, "got http error, fail");
        });
    });
};
