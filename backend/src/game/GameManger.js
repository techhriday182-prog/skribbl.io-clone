const Game = require("./Game");

class GameManager {
    constructor(io) {
        this.io = io;
        this.games = new Map();
    }

    createGame(room) {
        const game = new Game(
            room,
            this.io
        );

        this.games.set(
            room.id,
            game
        );

        return game;
    }

    getGame(roomId) {
        return this.games.get(roomId);
    }

    deleteGame(roomId) {
        const game =
            this.games.get(roomId);

        if (game) {
            game.clearTimers();
        }

        this.games.delete(roomId);
    }
}

module.exports = GameManager;