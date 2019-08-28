var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

var AssignmentSchema = new Schema({
  Addresses: {
    type: [{
      address: String,
      completed: Boolean
    }],
    required: true
  },
  Date: {
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
var Assignment = mongoose.model('Assignment', AssignmentSchema);

module.exports=Assignment;