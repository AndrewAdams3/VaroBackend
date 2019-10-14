var socket_io = require('socket.io');
var io = socket_io();
var socketApi = {};

socketApi.io = io;

io.on('connection', function(socket){
    console.log("connected")
    socket.on("disconnect", () => {
        console.log("disconnected")
    })
});

module.exports = socketApi;