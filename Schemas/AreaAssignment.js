var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

var AreaAssignmentSchema = new Schema({
  bounds: {
    type: [{lat: Number, lng: Number}],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  userId: {
    type: ObjectId
  },
  completed: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    required: false
  }
});

var AreaAssignment = mongoose.model('AreaAssignment', AreaAssignmentSchema);

module.exports=AreaAssignment;