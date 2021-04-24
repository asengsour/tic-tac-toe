// npm run start

// imports
require('dotenv').config()
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 80;

// MongoDB Atlas
// var MongoClient = require('mongodb').MongoClient;
// MongoClient.connect(process.env.uri, function(err, db) {

//     var cursor = db.collection('player').find();

//     cursor.each(function(err, doc) {

//         console.log(doc);

//     });
// });

// Static Files
app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))

// Set Views
app.set('views', './views')
app.set('view engine', 'js')

// Set Data
app.set('data', './data')

app.get('', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})



// server-side
io.on('connection', (socket) => {
    var rooms = io.sockets.adapter.rooms;
    var currentRoomId;

    socket.on('search-rooms', (availableRoom, userId, isRandomMatch) => {
        if (availableRoom != null && availableRoom != 'checked') {
            io.sockets.to(userId).emit('room-available', availableRoom, isRandomMatch);
            currentRoomId = availableRoom;
        } else if (availableRoom == 'checked') {
            io.sockets.to(userId).emit('room-available', null, isRandomMatch);
        } else {
            // Go through each room in server
            for (var searchRoomId in rooms) {
                // Check if room is a game room
                io.sockets.to(searchRoomId).emit('restriction', searchRoomId, userId, isRandomMatch);
            }
        }
    });
    socket.on('gameplay', ([data, roomId]) => {
        io.sockets.to(roomId).emit('gameplay', [data, roomId]);
    });
    socket.on('host', ([restriction, roomId]) => {
        gameData = {
            "players": [socket.id],
            "player_turn": { 'x': socket.id },
            "result": { 'null': null },
            "board": { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0 },
            "spaces_left": 9,
            "in_session": false,
            "restriction": restriction,
        };
        socket.join(roomId);
        currentRoomId = roomId;
        io.sockets.to(roomId).emit('gameplay', [gameData, roomId]);
        console.log(`host: ${socket.id} has started a gameroom: ${roomId}`);
    });
    socket.on('opponent-connect', ([opponentId, roomId]) => {
        // Check if players full
        if (roomId in rooms) {
            if (rooms[roomId].length < 3) {
                io.sockets.to(roomId).emit('opponent-connect', opponentId);
            }
        } else {
            console.log(`${roomId} does not exist`);
        }
    });
    socket.on('join-room', (roomId) => {
        // Check to see if room exists
        if (roomId in rooms) {
            // Check if room is game room
            if (roomId.length == 5) {
                socket.join(roomId);
                currentRoomId = roomId;
                io.sockets.to(roomId).emit('join-room');
                console.log(`player: ${socket.id} has joined gameroom: ${roomId}`);
            }
        } else {
            console.log(`${roomId} does not exist`);
        }
    });
    socket.on('disconnecting', () => {
        io.sockets.to(currentRoomId).emit('disconnected', socket.id);
    });
});

// Listen on port 80
server.listen(port, () => console.info(`Listening on port ${port}`))