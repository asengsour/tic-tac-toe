const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomId = document.getElementById('room-id');
const userList = document.getElementById('users');

// Get user and room from URL
const { user, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

const socket = io();


// Join game room
socket.emit('joinRoom', { user, room });

// Get room and user
socket.on('roomUsers', ({ room, user }) => {
    outputRoomName(room);
    outputUsers(user);
});

// User move from server
socket.on('move', (move) => {
    console.log(move);
    outputMove(move);
});

// User move submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get message text
    // let msg = e.target.elements.msg.value;
    // bool movePos = find which element was clicked

    if (!movePos) {
        return false;
    }

    // Emit User move to server
    socket.emit('chatMessage', msg);

    // Clear movePos
    // reset movePos value
});

// Output User move to game room
function outputMove(movePosition) {
    // const div = document.createElement('div');
    // div.classList.add('message');
    // const p = document.createElement('p');
    // p.classList.add('meta');
    // p.innerText = message.user;
    // p.innerHTML += `<span>${message.time}</span>`;
    // div.appendChild(p);
    // const para = document.createElement('p');
    // para.classList.add('text');
    // para.innerText = message.text;
    // div.appendChild(para);
    // document.querySelector('.chat-messages').appendChild(div);
}

// Generate room id to game room
function outputRoomId(room) {
    roomId.innerText = room;
}

// Add user to game room
function outputUsers(users) {
    userList.innerHTML = '';
    users.forEach((user) => {
        const li = document.createElement('li');
        li.innerText = user.user;
        userList.appendChild(li);
    });
}

//Prompt the user before leaving the game room
document.getElementById('leave-btn').addEventListener('click', () => {
    const leaveRoom = confirm('Are you sure you want to leave the Game?');
    if (leaveRoom) {
        window.location = '../index.html';
    } else {}
});