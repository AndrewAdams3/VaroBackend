var mongoose = require('mongoose');
const io = require('../socket').io;

//Define a schema
var Schema = mongoose.Schema;

var TrackSchema = new Schema({
    path: {
        type: [{
            latitude: Number,
            longitude: Number,
            timestamp: Number,
            speed: Number
        }],
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    userId: {
        type: String,
        required: true
    }
});

var TrackModel = mongoose.model('Track', TrackSchema);

TrackModel.watch().on("change", (update) => {
    if(update.operationType === 'update'){
        io.sockets.emit("update-track", update.documentKey._id);
    } else if( update.operationType === 'insert') {
        io.sockets.emit("new-track", update.documentKey._id);
    } else if(update.operationType === 'delete') {
        io.sockets.emit("delete-track", update.documentKey._id);
    } else if(update.operationType === 'replace') {
        io.sockets.emit("update-track", update.documentKey._id);
    } else {
        console.log("uncaught update", update)
    }
})

module.exports=TrackModel;