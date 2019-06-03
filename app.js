//Includes
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var bodyParser = require('body-parser');
var cors = require('cors');
var mongoose = require('mongoose');

//Initialize App
var app = express();

//Routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var drivebyRouter = require('./routes/drivebys');
var timesRouter = require('./routes/times');

//Storage
app.use('/file', express.static(path.join(__dirname + '/file')))


//Mongo Setup
const mongoip = '127.0.0.1';

var url = 'mongodb://' + mongoip + ':2771/VaroDB';
//var url = 'mongodb://varodb:varopass@' + mongoip + ':2771/VaroDB';

mongoose.connect(url, { useNewUrlParser: true });
mongoose.Promise = global.Promise;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({ limit: '10mb', extended: true }));
app.use(cors());

//Routes
app.use('/', indexRouter);
app.use('/data/users', usersRouter);
app.use('/data/drivebys', drivebyRouter);
app.use('/data/times', timesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
