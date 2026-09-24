import { useEffect, useState } from "react";

import socket from "./socket";

import Lobby from "./components/Lobby";
import Game from "./components/Game";

function App() {

    const [room, setRoom] =
        useState(null);

    const [playerId, setPlayerId] =
        useState(null);

    useEffect(() => {

        socket.on("room-state", (roomState) => {

            setRoom(roomState);

            setPlayerId(socket.id);
        });

        return () => {
            socket.off("room-state");
        };

    }, []);

    if (!room) {
        return <Lobby />;
    }

    return (
        <Game
            room={room}
            playerId={playerId}
        />
    );
}

export default App;