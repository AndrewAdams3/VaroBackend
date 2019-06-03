//Includes
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var bodyParser = require('body-parser');
var cors = require('cors');
var mkdirp = require('mkdirp');
const fs = require('fs');
const nodemailer = require('nodemailer');
const multer = require('multer');
var mongoose = require('mongoose');
var crypto = require('crypto');

//External Setups (AWS / Google Sheets)
const uploadFile = require('./aws').uploadFile;
const AppendDB = require('./sheets');

//Initialize App
var app = express();

//Routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var drivebyRouter = require('./routes/drivebys');

//Storage
app.use('/file', express.static(path.join(__dirname + '/file')))

const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    var path = './file/uploads/profilePics/'
    mkdirp(path, function (err) {
      cb(null, path);
    });
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const date = new Date()
    var path = './file/uploads/' + date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + (date.getDate()) + '/';
    console.log("path of new Image: ", path);
    mkdirp(path, function (err) {
      cb(null, path);
    });
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

const upload = multer({ storage: storage });
const upload2 = multer({ storage: storage2 });

//Mongo Setup
const ip = '134.209.62.80';
const mongoip = '127.0.0.1';

var url = 'mongodb://varodb:varopass@' + mongoip + ':2771/VaroDB';
const User = require('./Schemas/UserModel');
const TimeClock = require('./Schemas/TimeClock');
const DB = require('./Schemas/DBModel');

mongoose.connect(url, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var db = mongoose.createConnection(ip + '/data/');


//Crypto
var generate_key = function () {
  var sha = crypto.createHash('sha256');
  sha.update(Math.random().toString());
  return sha.digest('hex');
};
var encryptPass = (pass) => {
  var sha = crypto.createHash('sha256');
  sha.update(pass);
  return sha.digest('hex');
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({ limit: '10mb', extended: true }));
app.use(cors());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/drivebys', drivebyRouter)

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
