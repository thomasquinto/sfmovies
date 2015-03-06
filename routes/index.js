var express = require('express');
var router = express.Router();

/**
 * GET home page. 
 * This is the main page of the application: a Map with markers signifying San Franciso film locations.
 */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'SF Movie Map' });
});

module.exports = router;
