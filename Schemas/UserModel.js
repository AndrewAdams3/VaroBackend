var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;
const TimeClock = require('./TimeClock')
const Assignment = require("./AssignmentModel")
const async = require('async')

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

var User = mongoose.model('User', UserSchema);

module.exports=User;