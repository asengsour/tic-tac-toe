var socket = io.connect('https://tic-tac-toe-2021.herokuapp.com/');
var variables = {
    'roomId': null,
    'joined': null,
    'gameData': {
        "players": [],
        "player_turn": { 'x': null },
        "result": { 'null': null },
        "board": { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0 },
        "spaces_left": 9,
        "in_session": false,
        "restriction": null,
    }
}
var visible_elements = [];

function removeItemAll(arr, value) {
    var i = 0;
    while (i < arr.length) {
        if (arr[i] === value) {
            arr.splice(i, 1);
        } else {
            ++i;
        }
    }
    return arr;
}

function updateVariables(data) {
    if (Array.isArray(data[0])) {
        // values[0] = variables index; values[1] = variable data
        data.forEach(values => variables[values[0]] = values[1]);
    } else {
        variables[data[0]] = data[1];
    }
}

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function visibility(visible, toggle) {
    elements = ['room-id', 'result', 'new-game',
        'join-room', 'title-waiting', 'start-menu',
        'side-menu', 'side-menu-show-button', 'restriction',
    ];
    //Make elements visible or toggle
    if (toggle === true) {
        for (var e of visible) {
            const mediaQuery = window.matchMedia('(max-width: 700px)');
            elements = [
                'result', 'join-room', 'title-waiting'
            ];

            if (mediaQuery.matches) {
                // Allow only visible elements to be toggled
                for (var _e of elements) {
                    var element = document.getElementsByClassName(_e)[0]
                    if (element.style.visibility === 'visible' && !visible_elements.includes(_e)) {
                        visible_elements.push(_e)
                    }
                }
                for (var _e of visible_elements) {
                    var toggle_e = document.getElementsByClassName(_e)
                    for (var i = 0; i < toggle_e.length; i++) {
                        toggle_e[i].style.visibility = (toggle_e[i].style.visibility === 'visible') ? 'hidden' : 'visible';
                    }
                }
            }

            // Make element(s) in visible array toggled
            var toggle_e = document.getElementsByClassName(e);
            for (var i = 0; i < toggle_e.length; i++) {
                toggle_e[i].style.display = '';
                toggle_e[i].style.visibility = (toggle_e[i].style.visibility === 'visible') ? 'hidden' : 'visible';
            }

        }
    } else {
        visible_elements = [];
        for (var e of visible) {

            // Makes visible_elements visible
            var toggle_e = document.getElementsByClassName(e);
            for (var i = 0; i < toggle_e.length; i++) {
                toggle_e[i].style.display = '';
                toggle_e[i].style.visibility = 'visible';
            }

            // Only hides elements that aren't meant to be visible
            for (var e of removeItemAll(elements, e)) {
                var toggle_e = document.getElementsByClassName(e);
                for (var i = 0; i < toggle_e.length; i++) {
                    toggle_e[i].style.display = 'none';
                    toggle_e[i].style.visibility = 'hidden';

                }

            }
        }
    }
}

function animate_board() {
    var board_e = document.getElementById("tic-tac-toe-board");
    var join_room_e = document.getElementsByClassName("join-room")[0];
    var title_wait_e = document.getElementsByClassName("title-waiting")[0];
    var side_menu_e = document.getElementsByClassName("side-menu")[0];
    var new_game_e = document.getElementsByClassName("new-game")[0];

    var inPlay = join_room_e.style.visibility === 'hidden' && title_wait_e.style.visibility === 'hidden'
    var sideMenuVisible = side_menu_e.style.visibility !== 'hidden'

    const mediaQuery = window.matchMedia('(max-width: 700px)');

    function moveBoardYAxis(yAxisPercentage) {
        new_game_e.style.top = `${yAxisPercentage}%`;
        new_game_e.style.transform = `translate(-50%, -${yAxisPercentage}%)`
        board_e.style.top = `${yAxisPercentage}%`;
        board_e.style.transform = `translate(-50%, -${yAxisPercentage}%)`
    }

    if (inPlay) {
        if (sideMenuVisible && mediaQuery.matches) {
            moveBoardYAxis(80)
        } else {
            moveBoardYAxis(50)
        }
    }
}

function joinRoom(roomId) {
    socket.emit('join-room', roomId);
    socket.emit('opponent-connect', [socket.id, roomId])
    var room_id_e = document.getElementsByClassName('room-id')[0];
    room_id_e.innerHTML = `room id: ${roomId}`;
}

function host(restriction) {
    visibility(['room-id', 'title-waiting', 'side-menu-show-button']);
    var room_id_e = document.getElementsByClassName('room-id')[0];
    const new_room_id = makeid(5);
    room_id_e.innerHTML = `room id: ${new_room_id}`;
    updateVariables([
        ['gameData', {
            "players": [],
            "player_turn": { 'x': null },
            "result": { 'null': null },
            "board": { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0 },
            "spaces_left": 9,
            "in_session": false,
            "restriction": restriction,
        }],
        ['joined', true]
    ]);
    socket.emit('host', [restriction, new_room_id]);
}

function newGame() {
    updateVariables(
        [
            ['gameData', {
                "players": [variables.gameData.players[0], variables.gameData.players[1]],
                "player_turn": { 'x': variables.gameData.players[0] },
                "result": { 'null': null },
                "board": { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0 },
                "spaces_left": 9,
                "in_session": true,
                "restriction": variables.gameData.restriction,
            }],
            ['roomId', variables.roomId]
        ]
    );
    socket.emit('gameplay', [variables.gameData, variables.roomId])
}

function end(result, players) {
    var result_e = document.getElementsByClassName('result')[0];
    var isPlayer = socket.id === variables.gameData.players[0] || socket.id === variables.gameData.players[1];

    // Refresh website
    if (result === undefined && players === undefined) {
        window.location = window.parent.location.origin
    }
    // Check if client is a player
    else if (isPlayer) {
        clientIsPlayerX = players[0] === socket.id
        result_e.innerHTML =
            ((result === 'x' && clientIsPlayerX) || (result === 'o' && !clientIsPlayerX)) ? 'WON' :
            (result === 'cat') ? 'CAT' : 'LOST'
        visibility(['new-game', 'result', 'room-id', 'side-menu-show-button']);
    } else if (!isPlayer) {
        visibility(['result', 'room-id', 'side-menu-show-button']);
        if (result !== null) {
            result_e.innerHTML = `${result.toUpperCase()} WON`
        }
    }
}

function resultCheck(board, spaces_left) {
    result = null;
    /* Wininng line positions for a 3 in a row based on
    [
    0,1,2
    3,4,5
    6,7,8
    ]
    */
    lines = [
        // Horizontal
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        //Vertical
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        //Diagonal
        [0, 4, 8],
        [2, 4, 6],

    ];
    for (const line of lines) {
        line_total = 0;
        for (const position of line) {
            line_total += board[position];
        }
        if (result === 'x' || result === 'o') {
            break;
        } else {
            result =
                (line_total === 3) ? 'x' :
                (line_total === -3) ? 'o' :
                ((line_total !== 3 || line_total !== -3) && spaces_left === 0) ? 'cat' :
                null;
        }
    }
    return result
}

window.addEventListener('keyup', function(event) {
    if (event.key == 13 || event.key == 'Enter') {
        if (event.target.matches('#input-room-id')) {
            joinRoom(event.target.value);
        }
    }
});

window.addEventListener('click', (event) => {
    if (event.target.matches('.host')) {
        visibility(['restriction', 'side-menu-show-button']);
    }
    if (event.target.matches('.restriction')) {
        (event.target.innerHTML === 'Private') ? host('private'): host('public');
    }
    if (event.target.matches('.join')) {
        visibility(['join-room', 'side-menu-show-button']);
    }
    if (event.target.matches('.random-match')) {
        socket.emit('search-rooms', [false, socket.id]);
    }
    if (event.target.matches('.leave')) {
        end();
    }
    if (event.target.matches('.side-menu-show-button')) {
        visibility(['side-menu'], true)
        animate_board()
    }
    var playerTurn = Object.values(variables.gameData.player_turn)[0] === socket.id;
    for (var i = 0; i < 9; i++) {
        // Only updates if box not clicked and in session
        if (event.target.matches(`.box${[i]}`) && playerTurn && variables.gameData.in_session) {
            box_position = event.target.className.split(' ')[0][3];
            //Change board value to which box was clicked or tapped
            variables.gameData.board[box_position] = (Object.keys(variables.gameData.player_turn)[0] === 'x') ? 1 : -1;
            //Lower amount of moves left by 1
            variables.gameData.spaces_left--;
            //Change turn to other player
            variables.gameData.player_turn = (Object.keys(variables.gameData.player_turn)[0] === 'x') ? { 'o': variables.gameData.players[1] } : { 'x': variables.gameData.players[0] };

            socket.emit('gameplay', [variables.gameData, variables.roomId])
        }
    }
});



socket.on('opponent-connect', (opponentId) => {
    updateVariables([
        ['gameData', {
            "players": [variables.gameData.players[0], opponentId],
            "player_turn": { 'x': variables.gameData.players[0] },
            "result": { 'null': null },
            "board": { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0 },
            "spaces_left": 9,
            "in_session": true,
            "restriction": variables.gameData.restriction,
        }],
        ['roomId', variables.roomId]
    ]);
    socket.emit('gameplay', [variables.gameData, variables.roomId])
});

socket.on('disconnected', (userId) => {
    wasDisconnectUserPlayer = (userId === variables.gameData.players[0] || userId === variables.gameData.players[1])
    result = (variables.gameData.players[0] === userId) ? 'o' : 'x';

    (wasDisconnectUserPlayer) ?
    (end(result, variables.gameData.players),
        socket.emit('gameplay', [variables.gameData, variables.roomId])) :
    null;
});

socket.on('restriction', ([searchRoomId, userId]) => {
    roomAvailable = (variables.gameData.restriction === 'public' && variables.gameData.players.length === 1) ? searchRoomId : 'checked';
    socket.emit('search-rooms', ([roomAvailable, userId]))
});

socket.on('room-available', (availableRoom) => {
    (availableRoom !== false) ? joinRoom(availableRoom): host('public');
});

socket.on('gameplay', ([data, gameRoomId]) => {
    updateVariables([
        ['gameData', data],
        ['roomId', gameRoomId]
    ]);
    gameResult = resultCheck(variables.gameData.board, variables.gameData.spaces_left);
    var playerTurn = Object.values(variables.gameData.player_turn)[0] === socket.id;
    var result = Object.keys((gameResult === 'x') ? { 'x': variables.gameData.players[0] } :
        (gameResult === 'o') ? { 'o': variables.gameData.players[1] } :
        (gameResult === 'cat') ? { 'cat': null } : { 'null': null })[0];
    var newGame = variables.gameData.spaces_left === 9;
    var inSession = variables.gameData.in_session;

    if ((inSession && variables.joined) || (newGame && inSession)) {
        visibility(['side-menu-show-button', 'room-id']);
        animate_board();
        updateVariables(['joined', false]);
    }
    if (result !== 'null') {
        end(result, variables.gameData.players)
        variables.gameData.in_session = false;
    }

    //Set background image for each box; 1 = x, -1 = o
    Object.entries(variables.gameData.board).forEach(entry => {
        var [box_position, box_value] = entry;
        box_e = document.getElementsByClassName(`box${box_position}`)[0];
        var selected = box_e.style.opacity === 1;
        box_e.style.display = 'inherit';
        //Reset board
        if (newGame) {
            box_e.style.visibility = 'initial';
            box_e.style.opacity = 0;
        }
        // For screens big enough, Make boxes unselected visibly hoverable based on turn or session state
        if (!selected && playerTurn) {
            box_e.style.visibility = 'visible';
            box_e.style.backgroundImage = `url('../img/${Object.keys(variables.gameData.player_turn)[0]}.svg')`
        } else if (!selected && (!playerTurn || result !== 'null')) {
            box_e.style.visibility = 'hidden';
        }
        // Set boxes state based on board value
        if (box_value === 1) {
            box_e.style.visibility = 'visible';
            box_e.style.opacity = 1;
            box_e.style.backgroundImage = `url('../img/x.svg')`;
        } else if (box_value === -1) {
            box_e.style.visibility = 'visible';
            box_e.style.opacity = 1;
            box_e.style.backgroundImage = `url('../img/o.svg')`;
        }
    });
});

socket.on('join-room', () => {
    updateVariables(['joined', true])
        // If client is player x then emit data to spectator
    if (variables.gameData.players[0] === socket.id) {
        socket.emit('gameplay', [variables.gameData, variables.roomId]);
    }
});