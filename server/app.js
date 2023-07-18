var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var https = require('https');

var index = require('./routes/index');
var events = require('./routes/events');
var races = require('./routes/races');
var participants = require('./routes/participants');
var bibs = require('./routes/bibs');
var count = require('./routes/count');
var timer = require('./routes/timer');
var boxes = require('./routes/boxes');
var results = require('./routes/results');
var authentification = require('./routes/login');
var announcer = require('./routes/announcer');
var passcodes = require('./routes/passcodes');



var app = express();
var credentials = {
  key: fs.readFileSync('./key/server-key.pem'),
  cert: fs.readFileSync('./key/server-cert.pem')
};
https.createServer(credentials, app).listen(3001);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/api/count', count);
app.use('/api/events', events);
app.use('/api/races', races);
app.use('/api/participants', participants);
app.use('/api/bibs', bibs);
app.use('/api/timer', timer);
app.use('/api/boxes', boxes);
app.use('/api/results', results);
app.use('/api/login', authentification);
app.use('/api/announcer', announcer);
app.use('/api/passcodes', passcodes);


app.use('/*', function (req, res) {
  res.sendFile(path.join(__dirname, './public', 'index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.sendStatus(err.status || 500);
  //res.render('error');
});


module.exports = app;
