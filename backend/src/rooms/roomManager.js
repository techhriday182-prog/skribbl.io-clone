class RoomManager {
    constructor() {
        this.rooms = new Map();
    }

    createRoom(roomId, hostId) {
        const room = {
            id: roomId,
            hostId,

            players: [],

            state: "LOBBY",

            settings: {
                maxPlayers: 8,
                rounds: 3,
                drawTime: 60
            },

            currentDrawerId: null,
            currentWord: null,

            round: 0,
            currentPlayerIndex: 0,
            roundEndsAt: null,

            wordOptions: [],
            guessedPlayers: new Set(),
            strokes: []
        };

        this.rooms.set(roomId, room);

        return room;
    }

    getRoom(roomId) {
        return this.rooms.get(roomId);
    }

    getRoomByPlayerId(playerId) {
        for (const room of this.rooms.values()) {

            const player = room.players.find(
                (player) => player.id === playerId
            );

            if (player) {
                return room;
            }
        }

        return null;
    }

    updateSettings(roomId, newSettings) {
        const room = this.getRoom(roomId);

        if (!room) {
            return null;
        }

        room.settings = {
            ...room.settings,
            ...newSettings
        };

        return room;
    }

    deleteRoom(roomId) {
        this.rooms.delete(roomId);
    }
}

module.exports = RoomManager;