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
  }
});

var DriveByModel = mongoose.model('DriveBy', DriveBy);

DriveByModel.watch().on("change", (update) => {
  console.log("update", update.documentKey._id);
  if(update.operationType === 'update'){
    console.log("updated")
    io.sockets.emit("update-db", update.documentKey._id);
  } else if( update.operationType === 'insert') {
    console.log("new db", update.documentKey._id);
    io.sockets.emit("new-db", update.documentKey._id);
  } else if(update.operationType === 'delete') {
    console.log("deleting", update.documentKey._id);
    io.sockets.emit("delete-db", update.documentKey._id);
  } else if(update.operationType === 'replace') {
    console.log("relpaced")
    io.sockets.emit("update-db", update.documentKey._id);
  } else {
    console.log("this update", update)
  }
})

module.exports = DriveByModel;