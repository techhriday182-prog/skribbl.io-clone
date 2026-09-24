const {
    getRandomWords
} = require("./words");

const {
    calculateGuesserScore,
    calculateDrawerScore
} = require("./scoring");


class Game {
    constructor (room, io) {
        this.room = room;
        this.io = io;

        this.timer = null;
        this.nextTurnTimer = null;
    }

    broadcastRoomState () {
        // const publicRoom = {
        //     id: this.room.id,

        //     hostId: this.room.hostId,

        //     players: this.room.players.map((player) => ({
        //         id: player.id,
        //         name: player.name,
        //         score: player.score,
        //         hasGuessed: player.hasGuessed
        //     })),

        //     state: this.room.state,

        //     currentDrawerId:
        //         this.room.currentDrawerId,

        //     round: this.room.round,

        //     maxRounds:
        //         this.room.maxRounds,

        //     roundEndsAt:
        //         this.room.roundEndsAt
        // };

        const publicRoom = {

            id: this.room.id,

            hostId: this.room.hostId,

            players: this.room.players.map((player) => ({
                id: player.id,
                name: player.name,
                score: player.score,
                hasGuessed: player.hasGuessed
            })),

            state: this.room.state,

            settings: {
                maxPlayers: this.room.settings.maxPlayers,
                rounds: this.room.settings.rounds,
                drawTime: this.room.settings.drawTime
            },

            currentDrawerId: this.room.currentDrawerId,

            round: this.room.round,

            roundEndsAt: this.room.roundEndsAt
        };

        this.io
            .to(this.room.id)
            .emit("room-state", publicRoom);
    }

    start() {
        if (this.room.players.length < 2) {
            this.io.to(this.room.id).emit(
                "error-message",
                "At least 2 players are required."
            );

            return;
        }

        this.room.state = "CHOOSING";
        this.room.round = 1;
        this.room.currentPlayerIndex = 0;


        this.startTurn();
    }
    startTurn() {
        if (this.room.players.length === 0) {
            return;
        }

        this.clearTimers();

        this.room.state = "CHOOSING";

        this.room.currentWord = null;

        this.room.guessedPlayers = new Set();

        this.room.strokes = [];

        for (const player of this.room.players) {
            player.hasGuessed = false;
        }

        const drawer =
            this.room.players[
                this.room.currentPlayerIndex %
                this.room.players.length
            ];

        this.room.currentDrawerId = drawer.id;

        const wordOptions = getRandomWords(3);

        this.room.wordOptions = wordOptions;

        this.broadcastRoomState();

        this.io
            .to(drawer.id)
            .emit("word-options", wordOptions);

        this.io
            .to(this.room.id)
            .emit("turn-started", {
                drawerId: drawer.id,
                drawerName: drawer.name,
                round: this.room.round
            });
    }

    selectWord(playerId, word) {
        if (
            this.room.state !== "CHOOSING"
        ) {
            return;
        }

        if (
            playerId !== this.room.currentDrawerId
        ) {
            return;
        }

        if (
            !this.room.wordOptions.includes(word)
        ) {
            return;
        }

        this.room.currentWord = word;

        this.room.state = "DRAWING";

        // this.room.roundEndsAt =
        //     Date.now() + 60000;

        this.room.roundEndsAt =
            Date.now() +
            this.room.settings.drawTime * 1000;

        this.room.strokes = [];

        this.io
            .to(playerId)
            .emit("word-selected", {
                word
            });

        this.io
            .to(this.room.id)
            .emit("drawing-started", {
                wordLength: word.length
            });

        this.broadcastRoomState();

        this.startTimer();
    }

    startTimer() {
        // this.clearTimers();

        // this.timer = setTimeout(() => {
        //     this.endTurn("time");
        // }, 60000);

        this.clearTimers();

        this.timer = setTimeout(() => {
            this.endTurn("time");
        }, this.room.settings.drawTime * 1000);
    }

    handleDraw(playerId, stroke) {
        if (
            this.room.state !== "DRAWING"
        ) {
            return;
        }

        if (
            playerId !== this.room.currentDrawerId
        ) {
            return;
        }

        this.room.strokes.push(stroke);

        this.io
            .to(this.room.id)
            .except(playerId)
            .emit("draw", stroke);
    }

    handleUndo(playerId) {
        if (
            playerId !== this.room.currentDrawerId
        ) {
            return;
        }

        if (this.room.strokes.length === 0) {
            return;
        }

        this.room.strokes.pop();

        this.io
            .to(this.room.id)
            .emit("undo");
    }

    handleClear(playerId) {
        if (
            playerId !== this.room.currentDrawerId
        ) {
            return;
        }

        this.room.strokes = [];

        this.io
            .to(this.room.id)
            .emit("clear-canvas");
    }

    handleGuess(player, guess) {
        if (
            this.room.state !== "DRAWING"
        ) {
            return;
        }

        if (
            player.id === this.room.currentDrawerId
        ) {
            return;
        }

        if (
            player.hasGuessed
        ) {
            return;
        }

        const normalizedGuess =
            guess.trim().toLowerCase();

        const normalizedWord =
            this.room.currentWord.toLowerCase();

        if (
            normalizedGuess === normalizedWord
        ) {
            const timeRemaining = Math.max(
                0,
                this.room.roundEndsAt -
                Date.now()
            );

            // const score =
            //     calculateGuesserScore(
            //         timeRemaining,
            //         60000
            //     );

            const score =
                calculateGuesserScore(
                    timeRemaining,
                    this.room.settings.drawTime * 1000
                );

            player.score += score;

            player.hasGuessed = true;

            this.room.guessedPlayers.add(
                player.id
            );

            const drawer =
                this.room.players.find(
                    (p) =>
                        p.id ===
                        this.room.currentDrawerId
                );

            if (drawer) {
                drawer.score += 50;
            }

            this.io
                .to(this.room.id)
                .emit("correct-guess", {
                    playerId: player.id,
                    playerName: player.name,
                    score
                });

            this.broadcastRoomState();

            const nonDrawerPlayers =
                this.room.players.filter(
                    (p) =>
                        p.id !==
                        this.room.currentDrawerId
                );

            if (
                this.room.guessedPlayers.size >=
                nonDrawerPlayers.length
            ) {
                this.endTurn("everyone-guessed");
            }

            return;
        }

        this.io
            .to(this.room.id)
            .emit("chat-message", {
                playerId: player.id,
                username: player.name,
                message: guess
            });
    }

    handleChat(player, message) {
        if (!message.trim()) {
            return;
        }

        this.io
            .to(this.room.id)
            .emit("chat-message", {
                playerId: player.id,
                username: player.name,
                message
            });
    }

    endTurn(reason) {
        if (
            this.room.state !== "DRAWING"
        ) {
            return;
        }

        this.clearTimers();

        this.room.state = "ROUND_END";

        this.io
            .to(this.room.id)
            .emit("round-ended", {
                reason,
                word: this.room.currentWord
            });

        this.broadcastRoomState();

        this.nextTurnTimer = setTimeout(() => {
            this.nextTurn();
        }, 3000);
    }

    nextTurn() {
        this.clearTimers();

        this.room.currentPlayerIndex++;

        if (
            this.room.currentPlayerIndex >=
            this.room.players.length
        ) {
            this.room.currentPlayerIndex = 0;

            this.room.round++;

            // if (
            //     this.room.round >
            //     this.room.maxRounds
            // ) {
            //     this.endGame();

            //     return;
            // }

            if (
                this.room.round >
                this.room.settings.rounds
            ) {
                this.endGame();

                return;
            }
        }

        this.startTurn();
    }

    endGame() {
        this.clearTimers();

        this.room.state = "GAME_END";

        const sortedPlayers = [
            ...this.room.players
        ].sort(
            (a, b) => b.score - a.score
        );

        const winner = sortedPlayers[0];

        this.io
            .to(this.room.id)
            .emit("game-ended", {
                players: sortedPlayers,
                winner
            });
    }

    removePlayer(playerId) {
        const index =
            this.room.players.findIndex(
                (player) =>
                    player.id === playerId
            );

        if (index === -1) {
            return;
        }

        const wasDrawer =
            this.room.currentDrawerId ===
            playerId;

        this.room.players.splice(index, 1);

        if (
            this.room.players.length === 0
        ) {
            this.clearTimers();

            return;
        }

        if (
            this.room.currentPlayerIndex >=
            this.room.players.length
        ) {
            this.room.currentPlayerIndex = 0;
        }

        if (wasDrawer) {
            this.room.currentPlayerIndex =
                this.room.currentPlayerIndex %
                this.room.players.length;

            if (
                this.room.state === "DRAWING" ||
                this.room.state === "CHOOSING"
            ) {
                this.startTurn();
            }
        }

        this.broadcastRoomState();
    }

    clearTimers() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        if (this.nextTurnTimer) {
            clearTimeout(this.nextTurnTimer);
            this.nextTurnTimer = null;
        }
    }
}

module.exports = Game;
