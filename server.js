// imports
// require('dotenv').config()
const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const app = express();
const server = createServer(app);
const io = new Server(server);
const port = process.env.PORT || 80;


// MongoDB Atlas
/* // var MongoClient = require('mongodb').MongoClient;
// MongoClient.connect(process.env.uri, function(err, db) {

//     var cursor = db.collection('player').find();

//     cursor.each(function(err, doc) {

//         console.log(doc);

//     });
// }); */

// Static Files
app.use(express.static('public'))
app.use('/css', express.static(join(__dirname, 'public')))
app.use('/js', express.static(join(__dirname, 'public')))

app.get('', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})



// server-side
io.on('connection', (socket) => {
    var rooms = Array.from(io.sockets.adapter.rooms.keys());
    var currentRoomId;
    var availableRooms = [];
    
    socket.on('search-rooms', (availableRoom, userId, isRandomMatch, roomCount, numOfGameRooms) => {
        // Random match search initated
        if (availableRoom == null) {
            availableRooms = [];
            var newRooms = [];
            // Go through each room in server to find new game rooms
            for (var room in rooms) {
                if (room[0].length == 5 && io.sockets.adapter.rooms[room].length == 1) {
                    newRooms.push(room);
                }
            }
            for (var searchRoom of newRooms) {
                roomCount++
                numOfGameRooms = newRooms.length;
                // Check if room restriction is public
                io.sockets.to(searchRoom).emit('search-rooms-restriction', searchRoom, userId, isRandomMatch, roomCount, numOfGameRooms);
            }
            // No new rooms found, creating new room
            if (newRooms.length == 0) {
                io.sockets.to(userId).emit('room-available', null, isRandomMatch);
            }
        }
        // Found public room, adding to array
        if (availableRoom != null && availableRoom != 'checked') {
            availableRooms.push(availableRoom)
        }
        // Checked all found rooms and not on initation
        if (availableRoom != null && roomCount == numOfGameRooms) {
            room = availableRooms[Math.floor(Math.random() * availableRooms.length)]
            io.sockets.to(userId).emit('room-available', room, isRandomMatch);
            currentRoomId = room;
        }
    });
    socket.on('data-update', ([data, roomId]) => {
        io.sockets.to(roomId).emit('data-update', [data, roomId]);
    });
    socket.on('new-game', (roomId, userId) => {
        io.sockets.to(roomId).emit('new-game', roomId, userId);
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
        io.sockets.to(roomId).emit('data-update', [gameData, roomId]);
        console.log(`host: ${socket.id} has started a gameroom: ${roomId}`);
    });
    socket.on('join-room', (roomId, userId) => {
        // Check to see if room exists
        console.info("join room",roomId,rooms,availableRooms)
        if (availableRooms.includes(roomId)) {
            socket.join(roomId);
            currentRoomId = roomId;
            io.sockets.to(roomId).emit('player-joined', userId);
            console.log(`player: ${userId} has joined gameroom: ${roomId}`);
        } else {
            console.log(`${roomId} does not exist`);
        }
    });
    socket.on('disconnecting', () => {
        io.sockets.to(currentRoomId).emit('disconnected', socket.id);
    });
});

// Listen on localhost:80
server.listen(port, () => console.info(`Listening on port ${port}`))