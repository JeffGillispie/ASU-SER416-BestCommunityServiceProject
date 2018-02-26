// setup tools
var express = require('express');
var	app = express();
var port = process.env.PORT || 8080;
var	sqlite = require('sqlite3').verbose();
var	db = new sqlite.Database('./app/data.db');
var	fs = require('fs');
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
require('./config/passport')(passport, fs, db); // pass passport for configuration
app.set('views', __dirname + '/views'); // set views directory
app.set('view engine', 'ejs'); // set up ejs for templating
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies, needed for auth
app.use(bodyParser.urlencoded()); // get information from html forms
app.use(bodyParser.json());
app.use(session({ secret: 'qwerty'})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
require('./app/routes.js')(app, passport, fs, db); // load routes
app.listen(port); // launch app
console.log('Running on port ' + port);
