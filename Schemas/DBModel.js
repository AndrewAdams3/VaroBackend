var mongoose = require('mongoose');
const io = require('../socket').io;

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
  },
  timeZone: {
    type: String,
    required: false
  }
});

var DriveByModel = mongoose.model('DriveBy', DriveBy);

DriveByModel.watch().on("change", (update) => {
  if(update.operationType === 'update'){
    io.sockets.emit("update-db", update.documentKey._id);
  } else if( update.operationType === 'insert') {
    io.sockets.emit("new-db", update.documentKey._id);
  } else if(update.operationType === 'delete') {
    io.sockets.emit("delete-db", update.documentKey._id);
  } else if(update.operationType === 'replace') {
    io.sockets.emit("update-db", update.documentKey._id);
  } else {
    console.log("uncaught update", update)
  }
})

module.exports = DriveByModel;