var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var TimeClockSchema = new Schema({
  startTime: {
    type: Number,
    default: new Date().getTime(),
    required: true
  },
  endTime: {
    type: Number,
    default: -1
  },
  totalTime: {
    type: Number,
    default: -1
  },
  userId: {
    type: String,
    default: ''
  },
  startLocation: {
    type: String,
    default: '',
    required: true
  },
  endLocation: {
    type: String,
    default: '',
  },
});

var TimeClock = mongoose.model('TimeClock', TimeClockSchema);

module.exports = TimeClock;