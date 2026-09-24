const crypto = require("crypto");

function generateRoomId() {
    return crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase();
}

function registerSocketHandlers(
    io,
    socket,
    roomManager,
    gameManager
) {

    socket.on(
        "create-room",
        ({ username }) => {

            if (!username?.trim()) {
                socket.emit(
                    "error-message",
                    "Username is required."
                );

                return;
            }

            const roomId =
                generateRoomId();

            const room =
                roomManager.createRoom(
                    roomId,
                    socket.id
                );

            room.players.push({
                id: socket.id,
                name: username.trim(),
                score: 0,
                hasGuessed: false
            });

            socket.join(roomId);

            gameManager.createGame(room);

            socket.emit(
                "room-created",
                {
                    roomId
                }
            );

            gameManager
                .getGame(roomId)
                .broadcastRoomState();
        }
    );

    socket.on(
        "join-room",
        ({ roomId, username }) => {

            if (
                !roomId ||
                !username?.trim()
            ) {
                socket.emit(
                    "error-message",
                    "Room ID and username are required."
                );

                return;
            }

            const room =
                roomManager.getRoom(
                    roomId.toUpperCase()
                );

            if (!room) {
                socket.emit(
                    "error-message",
                    "Room not found."
                );

                return;
            }

            if (
                room.state !== "LOBBY"
            ) {
                socket.emit(
                    "error-message",
                    "Game has already started."
                );

                return;
            }

            // if (
            //     room.players.length >= 8
            // ) {
            //     socket.emit(
            //         "error-message",
            //         "Room is full."
            //     );

            //     return;
            // }

            if (
                room.players.length >=
                room.settings.maxPlayers
            ) {
                socket.emit(
                "error-message",
                "Room is full."
                );

                return;
            }

            const player = {
                id: socket.id,
                name: username.trim(),
                score: 0,
                hasGuessed: false
            };

            room.players.push(player);

            socket.join(room.id);

            socket.emit(
                "room-joined",
                {
                    roomId: room.id
                }
            );

            io.to(room.id).emit(
                "player-joined",
                {
                    player
                }
            );

            gameManager
                .getGame(room.id)
                .broadcastRoomState();
        }
    );

    socket.on(
        "start-game",
        () => {

            const room =
                roomManager.getRoomByPlayerId(
                    socket.id
                );

            if (!room) {
                return;
            }

            if (
                room.hostId !== socket.id
            ) {
                return;
            }

            const game =
                gameManager.getGame(
                    room.id
                );

            game.start();
        }
    );

    socket.on(
        "select-word",
        ({ word }) => {

            const room =
                roomManager.getRoomByPlayerId(
                    socket.id
                );

            if (!room) {
                return;
            }

            const game =
                gameManager.getGame(
                    room.id
                );

            game.selectWord(
                socket.id,
                word
            );
        }
    );

    socket.on(
        "draw",
        (stroke) => {

            const room =
                roomManager.getRoomByPlayerId(
                    socket.id
                );

            if (!room) {
                return;
            }

            const game =
                gameManager.getGame(
                    room.id
                );

            game.handleDraw(
                socket.id,
                stroke
            );
        }
    );

    socket.on(
        "undo",
        () => {

            const room =
                roomManager.getRoomByPlayerId(
                    socket.id
                );

            if (!room) {
                return;
            }

            const game =
                gameManager.getGame(
                    room.id
                );

            game.handleUndo(
                socket.id
            );
        }
    );

    socket.on(
        "clear-canvas",
        () => {

            const room =
                roomManager.getRoomByPlayerId(
                    socket.id
                );

            if (!room) {
                return;
            }

            const game =
                gameManager.getGame(
                    room.id
                );

            game.handleClear(
                socket.id
            );
        }
    );

    socket.on(
        "guess",
        ({ guess }) => {

            const room =
                roomManager.getRoomByPlayerId(
                    socket.id
                );

            if (!room) {
                return;
            }

            const player =
                room.players.find(
                    (player) =>
                        player.id ===
                        socket.id
                );

            if (!player) {
                return;
            }

            const game =
                gameManager.getGame(
                    room.id
                );

            game.handleGuess(
                player,
                guess
            );
        }
    );

    socket.on(
        "chat-message",
        ({ message }) => {

            const room =
                roomManager.getRoomByPlayerId(
                    socket.id
                );

            if (!room) {
                return;
            }

            const player =
                room.players.find(
                    (player) =>
                        player.id ===
                        socket.id
                );

            if (!player) {
                return;
            }

            const game =
                gameManager.getGame(
                    room.id
                );

            game.handleChat(
                player,
                message
            );
        }
    );

    socket.on(
        "disconnect",
        () => {

            const room =
                roomManager.getRoomByPlayerId(
                    socket.id
                );

            if (!room) {
                return;
            }

            const game =
                gameManager.getGame(
                    room.id
                );

            game.removePlayer(
                socket.id
            );

            io.to(room.id).emit(
                "player-left",
                {
                    playerId: socket.id
                }
            );

            if (
                room.players.length === 0
            ) {
                gameManager.deleteGame(
                    room.id
                );

                roomManager.deleteRoom(
                    room.id
                );
            }
        }
    );

    socket.on("update-settings", (settings) => {

    const room =
        roomManager.getRoomByPlayerId(socket.id);

    if (!room) {
        return;
    }

    // Only host can change settings
    if (room.hostId !== socket.id) {

        socket.emit(
            "error-message",
            "Only the host can change room settings."
        );

        return;
    }

    // Settings can only be changed before the game starts
    if (room.state !== "LOBBY") {

        socket.emit(
            "error-message",
            "Room settings cannot be changed after the game starts."
        );

        return;
    }

    const maxPlayers =
        Number(settings.maxPlayers);

    const rounds =
        Number(settings.rounds);

    const drawTime =
        Number(settings.drawTime);

    // Validate max players
    if (
        !Number.isInteger(maxPlayers) ||
        maxPlayers < 2 ||
        maxPlayers > 8
    ) {
        socket.emit(
            "error-message",
            "Max players must be between 2 and 8."
        );

        return;
    }

    // Validate rounds
    if (
        !Number.isInteger(rounds) ||
        rounds < 1 ||
        rounds > 10
    ) {
        socket.emit(
            "error-message",
            "Rounds must be between 1 and 10."
        );

        return;
    }

    // Validate drawing time
    if (
        !Number.isInteger(drawTime) ||
        drawTime < 30 ||
        drawTime > 120
    ) {
        socket.emit(
            "error-message",
            "Drawing time must be between 30 and 120 seconds."
        );

        return;
    }

    // Don't allow max players below current player count
    if (maxPlayers < room.players.length) {

        socket.emit(
            "error-message",
            `There are already ${room.players.length} players in the room.`
        );

        return;
    }

    room.settings = {
        maxPlayers,
        rounds,
        drawTime
    };

    // Send updated room state to everyone
    gameManager
        .getGame(room.id)
        .broadcastRoomState();
});
}



module.exports = registerSocketHandlers;