import RoomSettings from "./RoomSettings";


import {
    useEffect,
    useState
} from "react";

import socket from "../socket";

import DrawingCanvas
    from "./DrawingCanvas";

import Chat from "./Chat";

import PlayerList
    from "./PlayerList";

import WordSelector
    from "./WordSelector";

import GameHeader
    from "./GameHeader";

function Game({ room, playerId }) {
    const isHost = room.hostId === playerId;

    const [players, setPlayers] =
        useState([]);

    const [gameState, setGameState] =
        useState("LOBBY");

    const [drawerId, setDrawerId] =
        useState(null);

    const [round, setRound] =
        useState(1);

    // const [maxRounds, setMaxRounds] =
    //     useState(3);

    const [wordOptions, setWordOptions] =
        useState([]);

    const [currentWord, setCurrentWord] =
        useState("");

    const [wordLength, setWordLength] =
        useState(0);

    const [roundEndsAt, setRoundEndsAt] =
        useState(null);

    const [winner, setWinner] =
        useState(null);

    useEffect(() => {

        socket.on(
            "room-state",
            (room) => {

                setPlayers(
                    room.players
                );

                setGameState(
                    room.state
                );

                setDrawerId(
                    room.currentDrawerId
                );

                setRound(
                    room.round
                );

                // setMaxRounds(
                //     room.settings.rounds
                // );

                setRoundEndsAt(
                    room.roundEndsAt
                );
            }
        );

        socket.on(
            "word-options",
            (words) => {
                setWordOptions(words);
            }
        );

        socket.on(
            "word-selected",
            ({ word }) => {
                setCurrentWord(word);
            }
        );

        socket.on(
            "drawing-started",
            ({ wordLength }) => {
                setWordLength(wordLength);
            }
        );

        socket.on(
            "round-ended",
            () => {
                setWordOptions([]);
                setCurrentWord("");
            }
        );

        socket.on(
            "game-ended",
            ({ winner }) => {
                setWinner(winner);
            }
        );

        return () => {

            socket.off("room-state");
            socket.off("word-options");
            socket.off("word-selected");
            socket.off("drawing-started");
            socket.off("round-ended");
            socket.off("game-ended");

        };

    }, []);

    const isDrawer =
        drawerId === socket.id;

    const startGame = () => {
        socket.emit("start-game");
    };

    if (winner) {

        return (
            <div className="game-over">

                <h1>Game Over!</h1>

                <h2>
                    Winner: {winner.name}
                </h2>

                <h3>
                    Score: {winner.score}
                </h3>

                <h2>Final Scores</h2>

                {players
                    .slice()
                    .sort(
                        (a, b) =>
                            b.score - a.score
                    )
                    .map((player) => (
                        <div
                            key={player.id}
                        >
                            {player.name} -
                            {" "}
                            {player.score}
                        </div>
                    ))}
            </div>
        );
    }

    return (
        <div className="game">

            <GameHeader
                round={round}
                maxRounds={room.settings.rounds}
                roundEndsAt={roundEndsAt}
                gameState={gameState}
                currentWord={
                    isDrawer
                        ? currentWord
                        : null
                }
                wordLength={wordLength}
            />

            <div className="game-layout">

                <div className="players">
                    <PlayerList
                        players={players}
                        drawerId={drawerId}
                    />

                    {/* {gameState === "LOBBY" &&
                        socket.id ===
                        players[0]?.id && (
                            <button
                                onClick={
                                    startGame
                                }
                            >
                                Start Game
                            </button>
                        )
                    } */}

                    {room.state === "LOBBY" && (
                        <div>

                            {isHost && (
                                <RoomSettings
                                room={room}
                                isHost={isHost}
                                />
                            )}

                            {!isHost && (
                                <p>
                                    Waiting for the host to start the game...
                                </p>
                            )}

                        {isHost && (
                            <button onClick={startGame}>
                                Start Game
                            </button>
                        )}

                        </div>
                    )}
                </div>

                <div className="canvas-area">

                    {isDrawer &&
                        gameState ===
                        "CHOOSING" && (
                            <WordSelector
                                words={
                                    wordOptions
                                }
                            />
                        )}

                    <DrawingCanvas
                        isDrawer={
                            isDrawer
                        }
                    />

                </div>

                <Chat
                    gameState={gameState}
                />

            </div>

            <div className="room-code">
                Room: {room.id}
            </div>

        </div>
    );
}

export default Game;