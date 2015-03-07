/**
 * Tests 'locations.json' endpoint.
 *
 * NOTE: Your server must be running for tests to run!
 */

// Http Client to invoke localhost test requests:
var http = require('http')
var testHost = 'localhost' // change if hosted elsewhere
var testPort = 80;

exports.testLocations1 = function(test){
    var options = {
        host: testHost,
        port: testPort,
        path: '/locations.json?exists=loc&limit=1'
    }; 

    http.get(options, function(response) {

        test.expect(4);
        test.ok(response.statusCode == '200', 'status code')
        
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        
        response.on('end', function() {            
            // Data reception is done, do whatever with it!
            var parsed = JSON.parse(body);

            test.ok(parsed.locations, 'valid locations response');
            test.ok(parsed.locations.length == 1, 'valid limit');
            test.ok(parsed.locations[0].loc, 'location exists');
            test.done();
        
        }).on('error', function(e) {           
            test.ok(false, "got http error, fail");
        });
    });
};

exports.testLocations2 = function(test){
    var options = {
        host: testHost,
        port: testPort,
        path: '/locations.json?title=Edtv'
    }; 

    http.get(options, function(response) {

        test.expect(4);
        test.ok(response.statusCode == '200', 'status code')
        
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        
        response.on('end', function() {            
            // Data reception is done, do whatever with it!
            var parsed = JSON.parse(body);

            test.ok(parsed.locations, 'valid locations response');
            test.ok(parsed.locations.length > 1, 'valid length');
            test.ok(parsed.locations[0].title == 'Edtv', 'valid title');
            test.done();
        
        }).on('error', function(e) {           
            test.ok(false, "got http error, fail");
        });
    });
};
