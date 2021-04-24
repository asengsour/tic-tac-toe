var socket = io.connect('https://tic-tac-toe-2021.herokuapp.com/');
// var socket = io.connect('http://127.0.0.1:80');

var variables = {
    'roomId': null,
    'joined': null,
    'gameData': {
        "players": [],
        "player_turn": { 'x': null },
        "result": { null: null },
        "board": { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0 },
        "spaces_left": 9,
        "in_session": false,
        "restriction": null,
    }
}
const mediaQuery = window.matchMedia('(max-width: 700px)');

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


function visibility(visible, action_type) {
    elements = ['room-id', 'result', 'new-game',
        'join-room', 'title-waiting', 'start-menu',
        'side-menu', 'side-menu-show-button', 'restriction',
    ];
    _elements = [
        'result', 'join-room', 'title-waiting', 'restriction'
    ];
    // Make elements visible or toggle
    if (action_type == 'toggle') {
        for (var e of visible) {
            if (mediaQuery.matches) {
                for (var _e of _elements) {
                    if ($(`.${_e}`).css('display') != 'none') {
                        $(`.${_e}`).css('visibility', $(`.${_e}`).css('visibility') == 'hidden' ? 'visible' : 'hidden');
                    }
                }
            }
            $(`.${e}`).toggle()
            $(`.${e}`).css('visibility', $(`.${e}`).css('visibility') == 'hidden' ? 'visible' : 'hidden');
        }
    }
    // Update _elements to hide if window size decreased
    else if (action_type == 'decreased') {
        for (var e of visible) {
            for (var _e of _elements) {
                if ($(`.${_e}`).css('visibility') === 'visible' && $(`.${e}`).css('visibility') === 'visible') {
                    $(`.${_e}`).css('visibility', 'hidden');
                }
            }
        }
        return
    }
    // Update _elements to show if window size increased
    else if (action_type == 'increased') {
        for (var e of visible) {
            for (var _e of _elements) {
                if ($(`.${_e}`).css('display') != 'none' && $(`.start-menu`).css('visibility') != 'visible') {
                    $(`.${_e}`).css('visibility', 'visible');
                }
            }
        }
        return
    } else {
        for (var e of visible) {
            // Makes visible_elements visible
            $(`.${e}`).css('display', '');
            $(`.${e}`).css('visibility', 'visible');
            // Only hides elements that aren't meant to be visible
            for (var _e of removeItemAll(elements, e)) {
                $(`.${_e}`).css('display', 'none');
                $(`.${_e}`).css('visibility', 'hidden');
            }
        }
    }
    animate_board()
}

function animate_board() {
    var inPlay = $('.join-room').css('visibility') == 'hidden' && $('.title-waiting').css('visibility') == 'hidden' && $('.restriction').css('visibility') == 'hidden'
    var sideMenuVisible = $('.side-menu').css('visibility') !== 'hidden'

    function moveBoardYAxis(yAxisPercentage) {
        $('#tic-tac-toe-board').css('top', `${yAxisPercentage}%`);
        $('#tic-tac-toe-board').css('transform', `translate(-50%, -${yAxisPercentage}%)`);
    }

    if (inPlay) {
        if (sideMenuVisible && mediaQuery.matches) {
            moveBoardYAxis(80)
        } else {
            moveBoardYAxis(50)
        }
    } else {
        moveBoardYAxis(80)
    }
}

function joinRoom(roomId) {
    socket.emit('join-room', roomId);
    socket.emit('opponent-connect', [socket.id, roomId])
    $('.room-id').html(`room id: ${roomId}`);
}

function host(restriction) {
    visibility(['room-id', 'title-waiting', 'side-menu-show-button']);
    const new_room_id = makeid(5);
    $('.room-id').html(`room id: ${new_room_id}`);
    updateVariables([
        ['gameData', {
            "players": [],
            "player_turn": { 'x': null },
            "result": { null: null },
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
    if (variables.gameData.players.length === 2) {
        updateVariables(
            [
                ['gameData', {
                    "players": [variables.gameData.players[0], variables.gameData.players[1]],
                    "player_turn": { 'x': variables.gameData.players[0] },
                    "result": { null: null },
                    "board": { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0 },
                    "spaces_left": 9,
                    "in_session": true,
                    "restriction": variables.gameData.restriction,
                }],
                ['roomId', variables.roomId]
            ]
        );
    } else {
        updateVariables(
            [
                ['gameData', {
                    "players": variables.gameData.players,
                    "player_turn": { 'x': variables.gameData.players[0] },
                    "result": { null: null },
                    "board": { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0 },
                    "spaces_left": 9,
                    "in_session": false,
                    "restriction": variables.gameData.restriction,
                }],
                ['roomId', variables.roomId]
            ]
        );
    }
    socket.emit('gameplay', [variables.gameData, variables.roomId])
}

function end(result, players) {
    var isPlayer = socket.id === variables.gameData.players[0] || socket.id === variables.gameData.players[1];

    // Refresh website
    if (result === undefined && players === undefined) {
        window.location = window.parent.location.origin
    }

    // Check if client is a player
    else if (isPlayer) {
        clientIsPlayerX = players[0] === socket.id
        $('.result').html(
            ((result === 'x' && clientIsPlayerX) || (result === 'o' && !clientIsPlayerX) || result === null) ? 'WON' :
            (result === 'cat') ? 'CAT' : 'LOST'
        );
        visibility(['new-game', 'result', 'room-id', 'side-menu-show-button']);
    } else if (!isPlayer) {
        visibility(['result', 'room-id', 'side-menu-show-button']);
        if (result !== null) {
            $('.result').html(`${result.toUpperCase()} WON`);
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

window.addEventListener('resize', () => {
    if (window.innerWidth <= 700) {
        visibility(['side-menu'], 'decreased')
    } else if (window.innerWidth >= 701) {
        visibility(['side-menu'], 'increased')
    }
});

window.addEventListener('keyup', (event) => {
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
        visibility(['side-menu'], 'toggle')
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
            "result": { null: null },
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

    playerRemaining = variables.gameData.players.filter(item => item !== userId)[0]
    whosTurn = Object.keys(variables.gameData.player_turn)[0];

    if (wasDisconnectUserPlayer) {
        updateVariables([
            'gameData', {
                "players": [playerRemaining],
                "player_turn": variables.gameData.player_turn,
                "result": variables.gameData.result,
                "board": variables.gameData.board,
                "spaces_left": variables.gameData.spaces_left,
                "in_session": false,
                "restriction": variables.gameData.restriction,
            }
        ]);

        if (variables.gameData.spaces_left < 9) {
            end(null, variables.gameData.players)
        }
        socket.emit('gameplay', [variables.gameData, variables.roomId]);
    }
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
    var result = Object.keys(
        (gameResult === 'x') ? { 'x': variables.gameData.players[0] } :
        (gameResult === 'o') ? { 'o': variables.gameData.players[1] } :
        (gameResult === 'cat') ? { 'cat': null } : { null: null }
    )[0];
    var newGame = variables.gameData.spaces_left === 9;
    var inSession = variables.gameData.in_session;
    if (inSession && (variables.joined || newGame)) {
        visibility(['side-menu-show-button', 'room-id']);
        updateVariables(['joined', false]);
    } else if (!inSession && variables.gameData.spaces_left == 9) {
        visibility(['side-menu-show-button', 'room-id', 'title-waiting']);
    }
    if (result !== null) {
        end(result, variables.gameData.players)
    }

    //Set background image for each box; 1 = x, -1 = o
    Object.entries(variables.gameData.board).forEach(entry => {
        var [box_position, box_value] = entry;
        var selected = $(`.box${box_position}`).css('opacity') == 1;
        $(`.box${box_position}`).css('display', 'inherit');
        // Set boxes state based on box value
        $(`.box${box_position}`).css('opacity',
            (box_value != 0) ? 1 : ''
        );
        // Set visibility
        if ((!selected && (!playerTurn || result !== null) || newGame)) {
            $(`.box${box_position}`).css('visibility',
                'hidden'
            );
        }
        $(`.box${box_position}`).css('visibility',
            ((!selected && playerTurn) || (box_value != 0)) ? 'visible' : null
        );
        // For screens big enough, Make boxes unselected visibly hoverable based on turn or session state
        if (!selected && playerTurn) {
            $(`.box${box_position}`).css('visibility', 'visible');
            $(`.box${box_position}`).css('background-image', `url('../img/${Object.keys(variables.gameData.player_turn)[0]}.svg')`);
        }
        //Set background-imagge
        $(`.box${box_position}`).css('background-image',
            (box_value == 1) ? `url('../img/x.svg')` :
            (box_value == -1) ? `url('../img/o.svg')` : null
        );
    });
});

socket.on('join-room', () => {
    updateVariables(['joined', true])
        // If client is player x then emit data to spectator
    if (variables.gameData.players[0] === socket.id) {
        socket.emit('gameplay', [variables.gameData, variables.roomId]);
    }
});