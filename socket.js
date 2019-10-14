var socket_io = require('socket.io');
var io = socket_io();
var socketApi = {};

socketApi.io = io;

io.on('connection', function(socket){
    socket.on("disconnect", () => {
    })
});

module.exports = socketApi;