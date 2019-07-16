var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var DriveBy = new Schema({
  address: {
    type: String,
    required: true
  },
  street: {
    type: String,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  picturePath: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: new Date(),
    required: true
  },
  type: {
    type: String,
    required: true
  },
  vacant: {
    type: Boolean,
    required: true
  },
  burned: {
    type: Boolean,
    required: true
  },
  boarded: {
    type: Boolean,
    required: true
  },
  finder: {
    type: String,
    required: true
  },
  lastFound: {
    type: Number,
    required: false
  }
});

var DriveByModel = mongoose.model('DriveBy', DriveBy);

module.exports = DriveByModel;