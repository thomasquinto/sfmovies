var express = require('express');
var router = express.Router();

/**
 * GET about page. 
 * Obligatory About page.
 */
router.get('/about', function(req, res, next) {
  res.render('about', { title: 'SF Movie Map' });
});

module.exports = router;
