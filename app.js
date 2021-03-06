/**
 * Entry point to start SF Movie Map web application.
 *
 * Possible Usages (node, nodemon, forever):
 *
 * node app.js
 *
 * nodemon app.js
 *
 * sudo forever start app.js
 */
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// MongoDB:
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/sfmovies');

var requireDir = require('require-dir');
var routes = requireDir('./routes');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Make MongoDB/Google Maps/Http accessible to router
app.use(function(req,res,next){
    req.db = db;
    next();
});

// routes:
app.get('/', routes.index);
app.get('/about', routes.about);
app.get('/locations', routes.locations);
app.get('/locations.json', routes.locations);
app.get('/autocomplete.json', routes.autocomplete);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var server = app.listen(80, function() {
    console.log('Listening on port %d', server.address().port);
});

module.exports = app;
