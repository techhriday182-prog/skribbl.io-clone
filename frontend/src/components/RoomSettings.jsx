import { useState } from "react";
import socket from "../socket";

function RoomSettings({ room, isHost }) {

    const [maxPlayers, setMaxPlayers] =
        useState(room.settings.maxPlayers);

    const [rounds, setRounds] =
        useState(room.settings.rounds);

    const [drawTime, setDrawTime] =
        useState(room.settings.drawTime);

    if (!isHost) {
        return null;
    }

    const updateSettings = () => {

        socket.emit("update-settings", {
            maxPlayers: Number(maxPlayers),
            rounds: Number(rounds),
            drawTime: Number(drawTime)
        });

    };

    return (
        <div className="room-settings">

            <h2>Room Settings</h2>

            <div className="setting-row">

                <label>
                    Max Players
                </label>

                <select
                    value={maxPlayers}
                    onChange={(e) =>
                        setMaxPlayers(e.target.value)
                    }
                >
                    {[2, 3, 4, 5, 6, 7, 8].map(
                        (number) => (
                            <option
                                key={number}
                                value={number}
                            >
                                {number}
                            </option>
                        )
                    )}
                </select>

            </div>


            <div className="setting-row">

                <label>
                    Rounds
                </label>

                <select
                    value={rounds}
                    onChange={(e) =>
                        setRounds(e.target.value)
                    }
                >
                    {Array.from(
                        { length: 10 },
                        (_, index) => index + 1
                    ).map(
                        (number) => (
                            <option
                                key={number}
                                value={number}
                            >
                                {number}
                            </option>
                        )
                    )}
                </select>

            </div>


            <div className="setting-row">

                <label>
                    Drawing Time
                </label>

                <select
                    value={drawTime}
                    onChange={(e) =>
                        setDrawTime(e.target.value)
                    }
                >
                    <option value="30">
                        30 sec
                    </option>

                    <option value="45">
                        45 sec
                    </option>

                    <option value="60">
                        60 sec
                    </option>

                    <option value="90">
                        90 sec
                    </option>

                    <option value="120">
                        120 sec
                    </option>

                </select>

            </div>


            <button
                className="save-settings"
                onClick={updateSettings}
            >
                Save Settings
            </button>

        </div>
    );
}

export default RoomSettings;