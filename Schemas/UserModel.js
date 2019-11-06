var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;
const TimeClock = require('./TimeClock')
const Assignment = require("./AssignmentModel")
const async = require('async')

const io = require('../socket').io;

var UserSchema = new Schema({
  email: {
    type: String,
    default: '',
    required: true
  },
  password:{
    type: String,
    default: '', 
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  profilePic: {
    type: String,
    default: ''
  },
  fName: {
    type: String,
    default: ''
  },
  lName: {
    type: String,
    default: ''
  },
  dateCreated: {
    type: Date,
    default: Date.now()
  },
  seshId: {
    type: String,
    default: ''
  },
  trackId: {
    type: String,
    default: '',
    required: false
  },
  isOnClock: {
    type: Boolean,
    default: false
  },
  city: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: ''
  },
  admin: {
    type: Boolean,
    default: false
  },
  webSesh: {
    type: Object,
    default: {
      lastPage: "",
      seshId: ""
    }
  },
  infoComplete: {
    type: Boolean,
    required: true,
    default: false
  },
  target: {
    area: String,
    date: Date || Number
  }
});

  UserSchema.methods.newPass = function (password){
    return password;
  }

  UserSchema.pre("remove", function(next, user) {
    async.parallel([
      TimeClock.deleteMany({
        userId: user._id
      }),
      Assignment.deleteMany({
        userId: user._id
      })
    ], (err, res)=>{
      if(err) console.log("error deleting user", err)
      else console.log("deleted these: ", res);
      next()
    })
  })

var UserModel = mongoose.model('User', UserSchema);

UserModel.watch().on("change", (update) => {
  if(update.operationType === 'update'){
    io.sockets.emit("update-user", update.documentKey._id);
  } else if( update.operationType === 'insert') {
    io.sockets.emit("new-user", update.documentKey._id);
  } else if(update.operationType === 'delete') {
    io.sockets.emit("delete-user", update.documentKey._id);
  } else if(update.operationType === 'replace') {
    io.sockets.emit("update-user", update.documentKey._id);
  } else {
    console.log("uncaught update", update)
  }
})

module.exports=UserModel;