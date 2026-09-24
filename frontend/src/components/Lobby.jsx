import { useState } from "react";

import socket from "../socket";

function Lobby() {

    const [username, setUsername] =
        useState("");

    const [roomId, setRoomId] =
        useState("");

    const createRoom = () => {

        if (!username.trim()) {
            return;
        }

        socket.emit(
            "create-room",
            {
                username
            }
        );
    };

    const joinRoom = () => {

        if (
            !username.trim() ||
            !roomId.trim()
        ) {
            return;
        }

        socket.emit(
            "join-room",
            {
                username,
                roomId
            }
        );
    };

    return (
        <div className="lobby">

            <h1>Skribbl Clone</h1>

            <input
                placeholder="Your name"
                value={username}
                onChange={(e) =>
                    setUsername(
                        e.target.value
                    )
                }
            />

            <button
                onClick={createRoom}
            >
                Create Room
            </button>

            <hr />

            <input
                placeholder="Room code"
                value={roomId}
                onChange={(e) =>
                    setRoomId(
                        e.target.value
                    )
                }
            />

            <button
                onClick={joinRoom}
            >
                Join Room
            </button>

        </div>
    );
}

export default Lobby;