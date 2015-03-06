/**
 * Tests 'locations.json' endpoint.
 *
 * NOTE: Your server must be running for tests to run!
 */

// Http Client to invoke localhost test requests:
var http = require('http')
var testHost = 'localhost' // change if hosted elsewhere
var testPort = 80;

exports.testLocations = function(test){

    var options = {
        host: testHost,
        port: testPort,
        path: '/locations.json?limit=1'
    }; 

    http.get(options, function(response) {

        test.expect(3);
        test.ok(response.statusCode == '200', 'status code, pass')
        
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        
        response.on('end', function() {
            
            // Data reception is done, do whatever with it!
            var parsed = JSON.parse(body);

            test.ok(parsed.locations, 'valid locations response, pass');
            test.ok(parsed.locations.length == 1, 'limit validation, pass');
            test.done();
        
        }).on('error', function(e) {           
            test.ok(false, "got http error, fail");
        });
    });
};
